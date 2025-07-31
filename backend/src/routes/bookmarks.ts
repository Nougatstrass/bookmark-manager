
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { bookmarks, tags, bookmarkTags } from "../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { json } from "body-parser";

const router = Router();

// Validation schema for incoming JSON
const createBookmarkSchema = z.object({
    url: z.string().url(),
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    favorite: z.boolean().optional().default(false),
    showOnStart: z.boolean().optional().default(false),
    tags: z.array(z.string().trim().min(1)).optional().default([])
});

// Create a bookmark with tags
router.post("/", async (req, res) => {
    const parsed = createBookmarkSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: parsed.error.flatten()
        });
    }

    const { url, title, description, favorite, showOnStart, tags: tagNames } = parsed.data;

    try {
        const result = await db.transaction(async (tx) => {

            // 1) URL uniqueness check at app level
            const existing = await tx.select({ id: bookmarks.id })
                .from(bookmarks)
                .where(eq(bookmarks.url, url));

            if (existing.length > 0) {
                // Throw a sentinel error we can catch below
                const e = new Error("URL already exists");
                // @ts-expect-error add code for easy branching
                e.code = "URL_EXISTS";
                throw e;
            }

            // 2) Insert the bookmark
            const [created] = await tx.insert(bookmarks)
                .values({
                    url,
                    title: title ?? null,
                    description: description ?? null,
                    favorite: !!favorite,
                    showOnStart: !!showOnStart
                    // createdAt/updatedAt are auto-managed by your schema defaults
                })
                .returning();

            // 3) Tags: Create any missing, then link all
            const normalized = Array.from(
                new Set((tagNames ?? []).map((t) => t.trim()).filter(Boolean))
            );

            if (normalized.length > 0) {
                // Fetch existing tags
                const existingTags = await tx
                    .select({ id: tags.id, name: tags.name })
                    .from(tags)
                    .where(inArray(tags.name, normalized));

                const existingMap = new Map(existingTags.map((t) => [t.name, t.id]));
                const missingNames = normalized.filter((n) => !existingMap.has(n));

                // Create missing tags
                let createdTags: { id: number; name: string }[] = [];

                if (missingNames.length > 0) {
                    createdTags = await tx
                        .insert(tags)
                        .values(missingNames.map((name) => ({ name })))
                        .returning({ id: tags.id, name: tags.name });
                }

                const tagIds = [
                    ...existingTags.map((t) => t.id),
                    ...createdTags.map((t) => t.id)
                ];

                // Link all tagIds to the bookmark
                if (tagIds.length > 0) {
                    await tx.insert(bookmarkTags).values(
                        tagIds.map((tagId) => ({
                            bookmarkId: created.id,
                            tagId
                        }))
                    );
                }
            }
            return created; // You can also choose to return tags here if you want
        });
        return res.status(201).json(result);
    } catch(err: any) {
        // 4) Graceful uniqueness handling (app-level + DB-level)
        if (err?.code === "URL_EXISTS" || err?.code === "23505") {
            // 23505 is Postgres unique_violation
            return res
                .status(409)
                .json({ error: "A bookmark with this URL already exists." });
        }
        console.error("POST /bookmarks failed:", err);
        return res.status(500).json({ error: "Failed to create bookmark." });
    }
});

// Fetch all bookmarks with their tags
router.get("/", async (req, res) => {
    try {
        // 1. Get all bookmarks
        const allBookmarks = await db.query.bookmarks.findMany();

        if (allBookmarks.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Get all tags for the found bookmark IDs
        const bookmarkIds = allBookmarks.map((b) => b.id);

        const allTags = await db.query.bookmarkTags.findMany({
            where: (bt, { inArray }) => inArray(bt.bookmarkId, bookmarkIds),
            with: {
                tag: true // eager-load the tag  info from the relation
            }
        });

        // 3. Group tags by bookmarkId
        const tagsByBookmarkId = new Map<number, string[]>();

        for (const bt of allTags) {
            const tagList = tagsByBookmarkId.get(bt.bookmarkId) ?? [];
            tagList.push(bt.tag.name);
            tagsByBookmarkId.set(bt.bookmarkId, tagList);
        }

        // 4. Return bookmarks with tags
        const withTags = allBookmarks.map((b) => ({
            ...b,
            tags: tagsByBookmarkId.get(b.id) ?? []
        }));

        return res.status(200).json(withTags);

    } catch(err) {
        console.error("GET /bookmarks failed:", err);
        return res.status(500).json({ error: "Failed to fetch bookmarks." });
    }
});

// Fetch one bookmark by ID
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    // Validate that ID is a positive integer
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({ error: "Invalid bookmark ID" });
    }

    try {
        // Fetch the bookmark with its tags (via the join table)
        const bookmark = await db.query.bookmarks.findFirst({
            where: (fields, { eq }) => eq(fields.id, id),
            with: {
                tags: {
                    columns: { id: false }, // Exclude row id from bookmarkTags table
                    with: {
                        tag: true // Fetch related tag from the tags table
                    } 
                }
            }
        }) as {
            id: number;
            url: string;
            title: string | null;
            description: string | null;
            favorite: boolean;
            showOnStart: boolean;
            createdAt: Date;
            updatedAt: Date;
            tags: {
                tag: {
                    name: string;
                };
            }[];
        };

        // Not found?
        if (!bookmark) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        // Normalize the tag list into an array of tag names
        const tagNames = bookmark.tags.map((bt) => bt.tag.name);

        // Return bookmark with tags
        return res.json({
            id: bookmark.id,
            url: bookmark.url,
            title: bookmark.title,
            description: bookmark.description,
            favorite: bookmark.favorite,
            showOnStart: bookmark.showOnStart,
            createdAt: bookmark.createdAt,
            updatedAt: bookmark.updatedAt,
            tags: tagNames
        });

    } catch(err) {
        console.error("GET /bookmarks/:id failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

//
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid bookmark ID" });
    }

    try {
        const deleted = await db
            .delete(bookmarks)
            .where(eq(bookmarks.id, id))
            .returning();

        if (deleted.length === 0) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        return res.status(200).json({ message: "Bookmark deleted", deleted: deleted[0] });

    } catch(err) {
        console.error("DELETE /bookmarks/:id failed:", err);
        return res.status(500).json({ error: "Failed to delete bookmark" });
    }
});

export default router;

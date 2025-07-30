
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { bookmarks, tags, bookmarkTags } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

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

// Create bookmark with tags
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

export default router;

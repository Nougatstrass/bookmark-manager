
import { Router } from "express";
import { db } from "../db";
import { bookmarks } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all bookmarks
router.get("/", async (req, res)=> {
    const allBookmarks = await db.select().from (bookmarks);
    res.json(allBookmarks);
});

// Get one bookmark by ID
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await db.select().from(bookmarks).where(eq(bookmarks.id, id));

    if (result.length === 0) {
        return res.status(404).json({ message: "Bookmark not found" });
    }
    res.json(result[0]);
});

// Create new bookmark
router.post("/", async (req, res) => {
    const { url, title, showOnStart, favorite } = req.body;

    if (!url) {
        return res.status(400).json({ message: "URL is required" });
    }

    const result = await db
        .insert(bookmarks)
        .values({ url, title, showOnStart: !!showOnStart, favorite: !!favorite })
        .returning();

    res.status(201).json(result[0]);
});

// Update bookmark by ID
router.put("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { url, title, showOnStart, favorite } = req.body;

    const result = await db
        .update(bookmarks)
        .set({ url, title, showOnStart: !!showOnStart, favorite: !!favorite })
        .where(eq(bookmarks.id, id))
        .returning();

    if (result.length === 0) {
        return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json(result[0]);
});

// Delete bookmark by ID
router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id)).returning();

    if (result.length === 0) {
        return res.status(404).json({ message: "Bookmark not found" });
    }

    res.status(204).send();
});

export default router;

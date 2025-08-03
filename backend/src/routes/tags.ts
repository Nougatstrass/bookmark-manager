
import { Router } from "express";
import { db } from "../db";
import { tags } from "../db/schema";
import { asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const allTags = await db
            .select()
            .from (tags)
            .orderBy(asc(tags.name));

        res.json(allTags);

    } catch(err) {
        console.error("GET /tags failed:", err);
        res.status(500).json({ error: "Failed to fetch tags" });
    }
});

export default router;

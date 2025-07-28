
import { Router } from 'express';
import { db } from "../db";
import { bookmarks } from '../db/schema';

const router = Router();

router.get("/", async (req, res)=> {
    try {
        const result = await db.select().from (bookmarks);
        res.json(result);
    } catch(err) {
        console.error("Failed to fetch bookmarks", err);
        res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
});

export default router;


import { Router } from 'express';

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "GET /bookmarks works!" });
});

export default router;

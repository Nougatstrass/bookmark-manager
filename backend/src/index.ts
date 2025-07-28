
import express from "express";
import cors from "cors";
import "dotenv/config";
import bookmarksRouter from "./routes/bookmarks";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use("/bookmarks", bookmarksRouter);
app.use(express.json());

// Root route
app.get("/", (req, res) => {
    res.send("Bookmark manager API is running");
});

app.post("/bookmarks", async (req, res) => {
    try {
        const { url, title } = req.body;

        // Temporary: Just return the data to confirm it's working
        res.status(200).json({ url, title });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

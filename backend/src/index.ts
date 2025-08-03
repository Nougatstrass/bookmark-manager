
import express from "express";
import cors from "cors";
import bookmarksRouter from "./routes/bookmarks";
import tagsRouter from "./routes/tags";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use("/bookmarks", bookmarksRouter);
app.use("/tags", tagsRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

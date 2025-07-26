
import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const bookmarks = pgTable("bookmarks", {
    id: serial("id").primaryKey(),
    url: text("url").notNull()
});

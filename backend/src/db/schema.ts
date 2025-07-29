
import { pgTable, serial, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
    id: serial("id").primaryKey(),
    url: varchar("url", { length: 2048 }).notNull().unique(),
    title: varchar("title", { length: 256 }),
    description: varchar("description", { length: 512 }),
    showOnStart: boolean("show_on_start").notNull().default(false),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// Tags table
export const tags = pgTable("tags", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 64 }).notNull().unique()
});

// Join table for bookmarks - tags (many to many)
export const bookmarkTags = pgTable("bookmark_tags", {
    bookmarkId: integer("bookmark_id").notNull().references(() => bookmarks.id, { onDelete: "cascade" }),
    tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" } )
});

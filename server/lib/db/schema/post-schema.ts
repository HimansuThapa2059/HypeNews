import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { postUpvotesTable } from "./upvote-schema";
import { commentsTable } from "./comment-schema";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  title: text("title").notNull(),
  url: text("url"),
  content: text("content"),
  points: integer("points").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const postRelations = relations(postsTable, ({ one, many }) => ({
  author: one(user, {
    fields: [postsTable.userId],
    references: [user.id],
    relationName: "author",
  }),

  comments: many(commentsTable),

  postUpvotesTable: many(postUpvotesTable, { relationName: "postUpvotes" }),
}));

export const insertPostSchema = createInsertSchema(postsTable, {
  title: z.string().min(3, { message: "Title must be atleast 3 chars" }),
  url: z.url({ message: "URL must be a valid URL" }).or(z.literal("")),
  content: z.string().or(z.literal("")),
});

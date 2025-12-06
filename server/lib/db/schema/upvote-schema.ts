import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { postsTable } from "./post-schema";
import { user } from "./auth-schema";
import { commentsTable } from "./comment-schema";

export const postUpvotesTable = pgTable("post_upvotes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: text("user_id"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const postUpvoteRelations = relations(postUpvotesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postUpvotesTable.postId],
    references: [postsTable.id],
    relationName: "postUpvotes",
  }),
  user: one(user, {
    fields: [postUpvotesTable.userId],
    references: [user.id],
    relationName: "user",
  }),
}));

export const commentUpvotesTable = pgTable("comment_upvotes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userId: text("user_id"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const commentUpvoteRelations = relations(
  commentUpvotesTable,
  ({ one }) => ({
    post: one(commentsTable, {
      fields: [commentUpvotesTable.commentId],
      references: [commentsTable.id],
      relationName: "commentUpvotes",
    }),
    user: one(user, {
      fields: [commentUpvotesTable.userId],
      references: [user.id],
      relationName: "user",
    }),
  })
);

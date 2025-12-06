import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { postsTable } from "./post-schema";
import { commentUpvotesTable } from "./upvote-schema";

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  postId: integer("post_id").notNull(),
  parentCommentId: integer("parent_comment_id"),
  content: text("content").notNull(),

  commentCount: integer("comment_count").default(0).notNull(),
  points: integer("points").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const commentRelations = relations(commentsTable, ({ one, many }) => ({
  author: one(user, {
    fields: [commentsTable.userId],
    references: [user.id],
    relationName: "author",
  }),

  parentComment: one(commentsTable, {
    fields: [commentsTable.parentCommentId],
    references: [commentsTable.id],
    relationName: "parentComment",
  }),

  childComments: many(commentsTable, {
    relationName: "childComments",
  }),

  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),

  commentUpvotes: many(commentUpvotesTable, { relationName: "commentUpvotes" }),
}));

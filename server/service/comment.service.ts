import { db } from "@/lib/db/db";
import { commentsTable } from "@/lib/db/schema/comment-schema";
import { postsTable } from "@/lib/db/schema/post-schema";
import { commentUpvotesTable } from "@/lib/db/schema/upvote-schema";
import { toIsoTimestampSql } from "@/lib/utils";
import type { paginationType } from "@/shared/types";
import type { User } from "better-auth";
import { and, asc, countDistinct, desc, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

interface replayCommentServiceInput {
  userId: string;
  commentId: number;
  content: string;
}
export const replayCommentService = async ({
  commentId,
  content,
  userId,
}: replayCommentServiceInput) => {
  const [comment] = await db.transaction(async (tx) => {
    const [parentComment] = await tx
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        depth: commentsTable.depth,
      })
      .from(commentsTable)
      .where(eq(commentsTable.id, commentId))
      .limit(1);

    if (!parentComment) {
      throw new HTTPException(404, {
        message: "Comment not found",
      });
    }

    const postId = parentComment.postId;

    const [updateParentComment] = await tx
      .update(commentsTable)
      .set({ commentCount: sql`${commentsTable.commentCount} + 1` })
      .where(eq(commentsTable.id, parentComment.id))
      .returning({ commentCount: commentsTable.commentCount });

    const [updatedPost] = await tx
      .update(postsTable)
      .set({ commentCount: sql`${postsTable.commentCount} + 1` })
      .where(eq(postsTable.id, postId))
      .returning({ commentCount: postsTable.commentCount });

    if (!updateParentComment || !updatedPost) {
      throw new HTTPException(404, {
        message: "Error creating comment",
      });
    }

    return await tx
      .insert(commentsTable)
      .values({
        content,
        userId,
        postId: postId,
        parentCommentId: parentComment.id,
        depth: parentComment.depth + 1,
      })
      .returning({
        id: commentsTable.id,
        userId: commentsTable.userId,
        postId: commentsTable.postId,
        content: commentsTable.content,
        points: commentsTable.points,
        depth: commentsTable.depth,
        parentCommentId: commentsTable.parentCommentId,
        createdAt: toIsoTimestampSql(commentsTable.createdAt).as("created_at"),
        commentCount: commentsTable.commentCount,
      });
  });

  return comment;
};

interface upvoteCommentServiceInput {
  userId: string;
  commentId: number;
}
export const upvoteCommentService = async ({
  commentId,
  userId,
}: upvoteCommentServiceInput): Promise<{
  count: number;
  isUpvoted: boolean;
}> => {
  let pointsChange: -1 | 1 = 1;

  const points = await db.transaction(async (tx) => {
    const [existingUpvote] = await tx
      .select()
      .from(commentUpvotesTable)
      .where(
        and(
          eq(commentUpvotesTable.commentId, commentId),
          eq(commentUpvotesTable.userId, userId)
        )
      )
      .limit(1);

    pointsChange = existingUpvote ? -1 : 1;

    const [updated] = await tx
      .update(commentsTable)
      .set({ points: sql`${commentsTable.points} + ${pointsChange}` })
      .where(eq(commentsTable.id, commentId))
      .returning({ points: commentsTable.points });

    if (!updated) {
      throw new HTTPException(404, { message: "Comment not found" });
    }

    if (existingUpvote) {
      await tx
        .delete(commentUpvotesTable)
        .where(eq(commentUpvotesTable.id, existingUpvote.id));
    } else {
      await tx.insert(commentUpvotesTable).values({ commentId, userId });
    }

    return updated.points;
  });

  return { count: points, isUpvoted: pointsChange > 0 };
};

type PaginatedCommentsServiceInput = paginationType & {
  user: User;
  commentId: number;
};
export const getPaginatedCommentsService = async ({
  limit,
  order,
  page,
  sortBy,
  user,
  commentId,
}: PaginatedCommentsServiceInput) => {
  const offset = (page - 1) * limit;

  const sortByColumn =
    sortBy === "points" ? commentsTable.points : commentsTable.createdAt;
  const sortOrder = order === "desc" ? desc(sortByColumn) : asc(sortByColumn);

  const [count] = await db
    .select({
      count: countDistinct(commentsTable.id),
    })
    .from(commentsTable)
    .where(eq(commentsTable.parentCommentId, commentId));

  const totalCount = count?.count ?? 0;

  const comments = await db.query.commentsTable.findMany({
    where: and(eq(commentsTable.parentCommentId, commentId)),
    orderBy: sortOrder,
    limit: limit,
    offset: offset,
    with: {
      author: {
        columns: {
          name: true,
          id: true,
        },
      },
      commentUpvotes: {
        columns: { userId: true },
        where: eq(commentUpvotesTable.userId, user?.id ?? ""),
        limit: 1,
      },
    },
    extras: {
      createdAt: toIsoTimestampSql(commentsTable.createdAt).as("created_at"),
    },
  });

  return { comments, totalCount };
};

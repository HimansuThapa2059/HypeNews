import { db } from "@/lib/db/db";
import { user as userTable } from "@/lib/db/schema/auth-schema";
import { commentsTable } from "@/lib/db/schema/comment-schema";
import { postsTable } from "@/lib/db/schema/post-schema";
import {
  commentUpvotesTable,
  postUpvotesTable,
} from "@/lib/db/schema/upvote-schema";
import { toIsoTimestampSql } from "@/lib/utils";
import type { Comment, paginationType } from "@/shared/types";
import type { User } from "better-auth";
import { and, asc, countDistinct, desc, eq, isNull, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

interface createPostServiceInput {
  title: string;
  content: string;
  url: string;
  userId: string;
}
export const createPostService = async ({
  title,
  content,
  url,
  userId,
}: createPostServiceInput) => {
  const [post] = await db
    .insert(postsTable)
    .values({ title, content, url, userId })
    .returning({ id: postsTable.id });

  return post;
};

type PaginatedPostsServiceInput = paginationType & {
  user: User;
};
export const getPaginatedPostsService = async ({
  limit,
  order,
  page,
  sortBy,
  author,
  site,
  user,
}: PaginatedPostsServiceInput) => {
  const offset = (page - 1) * limit;

  const sortByColumn =
    sortBy === "points" ? postsTable.points : postsTable.createdAt;
  const sortOrder = order === "desc" ? desc(sortByColumn) : asc(sortByColumn);

  const [count] = await db
    .select({ count: countDistinct(postsTable.id) })
    .from(postsTable)
    .where(
      and(
        author ? eq(postsTable.userId, author) : undefined,
        site ? eq(postsTable.url, site) : undefined
      )
    );

  const totalCount = count?.count ?? 0;

  const postsQuery = db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      url: postsTable.url,
      points: postsTable.points,
      createdAt: toIsoTimestampSql(postsTable.createdAt),
      commentCount: postsTable.commentCount,
      content: postsTable.content,
      author: {
        username: userTable.name,
        id: userTable.id,
      },
      isUpvoted: user
        ? sql<boolean>`CASE WHEN ${postUpvotesTable.userId} IS NOT NULL THEN true ELSE false END`
        : sql<boolean>`false`,
    })
    .from(postsTable)
    .leftJoin(userTable, eq(postsTable.userId, userTable.id))
    .orderBy(sortOrder)
    .limit(limit)
    .offset(offset)
    .where(
      and(
        author ? eq(postsTable.userId, author) : undefined,
        site ? eq(postsTable.url, site) : undefined
      )
    );

  if (user) {
    postsQuery.leftJoin(
      postUpvotesTable,
      and(
        eq(postUpvotesTable.postId, postsTable.id),
        eq(postUpvotesTable.userId, user.id)
      )
    );
  }

  const posts = await postsQuery;

  return { posts, count: totalCount };
};

interface upvotePostInput {
  userId: string;
  postId: number;
}
export const upvotePostService = async ({
  postId,
  userId,
}: upvotePostInput): Promise<{ count: number; isUpvoted: boolean }> => {
  let pointsChange: -1 | 1 = 1;

  const points = await db.transaction(async (tx) => {
    const [existingUpvote] = await tx
      .select()
      .from(postUpvotesTable)
      .where(
        and(
          eq(postUpvotesTable.postId, postId),
          eq(postUpvotesTable.userId, userId)
        )
      )
      .limit(1);

    pointsChange = existingUpvote ? -1 : 1;

    const [updated] = await tx
      .update(postsTable)
      .set({ points: sql`${postsTable.points} + ${pointsChange}` })
      .where(eq(postsTable.id, postId))
      .returning({ points: postsTable.points });

    if (!updated) {
      throw new HTTPException(404, { message: "Post not found" });
    }

    if (existingUpvote) {
      await tx
        .delete(postUpvotesTable)
        .where(eq(postUpvotesTable.id, existingUpvote.id));
    } else {
      await tx
        .insert(postUpvotesTable)
        .values({ postId: postId, userId: userId });
    }

    return updated.points;
  });

  return { count: points, isUpvoted: pointsChange > 0 };
};

export class CommentCreationError extends Error {
  constructor(message: string = "Failed to create comment") {
    super(message);
    this.name = "CommentCreationError";
    Object.setPrototypeOf(this, CommentCreationError.prototype);
  }
}

export const createCommentForPost = async (
  postId: number,
  content: string,
  user: User
): Promise<Comment> => {
  const newlyCreatedComment = await db.transaction(async (tx) => {
    const [updatedPost] = await tx
      .update(postsTable)
      .set({ commentCount: sql`${postsTable.commentCount} + 1` })
      .where(eq(postsTable.id, postId))
      .returning({ commentCount: postsTable.commentCount });

    if (!updatedPost) {
      throw new HTTPException(404, { message: "Post not found" });
    }

    const [insertedComment] = await tx
      .insert(commentsTable)
      .values({
        content,
        userId: user.id,
        postId: postId,
      })
      .returning({
        id: commentsTable.id,
        userId: commentsTable.userId,
        postId: commentsTable.postId,
        depth: commentsTable.depth,
        content: commentsTable.content,
        points: commentsTable.points,
        parentCommentId: commentsTable.parentCommentId,
        createdAt: toIsoTimestampSql(commentsTable.createdAt).as("created_at"),
        commentCount: commentsTable.commentCount,
      });

    if (!insertedComment) {
      throw new CommentCreationError("Failed to insert comment into database.");
    }

    return insertedComment;
  });

  return {
    ...newlyCreatedComment,
    commentUpvotes: [],
    childComments: [],
    author: {
      username: user.name,
      id: user.id,
    },
  } as Comment;
};

type getCommentsServiceInput = paginationType & {
  user: User;
  includeChildren?: boolean;
  postId: number;
};
export const getCommentsService = async ({
  includeChildren = false,
  limit,
  order,
  page,
  sortBy,
  user,
  postId,
}: getCommentsServiceInput) => {
  const offset = (page - 1) * limit;

  const [postExists] = await db
    .select({ exists: sql`1` })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!postExists) {
    throw new HTTPException(404, { message: "Post not found" });
  }

  const sortByColumn =
    sortBy === "points" ? commentsTable.points : commentsTable.createdAt;

  const sortOrder = order === "desc" ? desc(sortByColumn) : asc(sortByColumn);

  const [count] = await db
    .select({ count: countDistinct(commentsTable.id) })
    .from(commentsTable)
    .where(
      and(
        eq(commentsTable.postId, postId),
        isNull(commentsTable.parentCommentId)
      )
    );

  const totalCount = count?.count ?? 0;

  const comments = await db.query.commentsTable.findMany({
    where: and(
      eq(commentsTable.postId, postId),
      isNull(commentsTable.parentCommentId)
    ),
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
      childComments: {
        limit: includeChildren ? 2 : 0,
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
        orderBy: sortOrder,
        extras: {
          createdAt: toIsoTimestampSql(commentsTable.createdAt).as(
            "created_at"
          ),
        },
      },
    },
    extras: {
      createdAt: toIsoTimestampSql(commentsTable.createdAt).as("created_at"),
    },
  });

  const typesafeComments = comments as Comment[];
  return {
    comments: typesafeComments,
    count: totalCount,
  };
};

interface getSpecificPostServiceInput {
  user: User | null;
  postId: number;
}
export const getSpecificPostService = async ({
  postId,
  user,
}: getSpecificPostServiceInput) => {
  const postsQuery = db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      url: postsTable.url,
      points: postsTable.points,
      content: postsTable.content,
      createdAt: toIsoTimestampSql(postsTable.createdAt),
      commentCount: postsTable.commentCount,
      author: {
        username: userTable.name,
        id: userTable.id,
      },
      isUpvoted: user
        ? sql<boolean>`CASE WHEN ${postUpvotesTable.userId} IS NOT NULL THEN true ELSE false END`
        : sql<boolean>`false`,
    })
    .from(postsTable)
    .leftJoin(userTable, eq(postsTable.userId, userTable.id))
    .where(eq(postsTable.id, postId));

  if (user) {
    postsQuery.leftJoin(
      postUpvotesTable,
      and(
        eq(postUpvotesTable.postId, postsTable.id),
        eq(postUpvotesTable.userId, user.id)
      )
    );
  }

  const [post] = await postsQuery;
  if (!post) {
    throw new HTTPException(404, { message: "Post not found" });
  }

  return post;
};

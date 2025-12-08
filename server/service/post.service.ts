import { db } from "@/lib/db/db";
import { user as userTable } from "@/lib/db/schema/auth-schema";
import { postsTable } from "@/lib/db/schema/post-schema";
import { postUpvotesTable } from "@/lib/db/schema/upvote-schema";
import { toIsoTimestampSql } from "@/lib/utils";
import type { paginationType } from "@/shared/types";
import type { User } from "better-auth";
import { and, asc, countDistinct, desc, eq, sql } from "drizzle-orm";
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

type PaginatedServiceInput = paginationType & {
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
}: PaginatedServiceInput) => {
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

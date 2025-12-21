import {
  getPaginatedCommentsService,
  replayCommentService,
  upvoteCommentService,
} from "@/service";
import {
  type Comment,
  type PaginatedResponse,
  type SuccessResponse,
} from "@/shared/types";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const replayComment = async (c: Context) => {
  const user = c.get("user");

  const { content } = c.req.valid("form");
  const { commentId } = c.req.valid("param");

  const comment = await replayCommentService({
    content,
    userId: user.id,
    commentId,
  });

  return c.json<SuccessResponse<Comment>>({
    success: true,
    message: "Comment Created",
    data: {
      ...comment,
      childComments: [],
      commentUpvotes: [],
      author: {
        name: user.username,
        id: user.id,
      },
    } as Comment,
  });
};

export const upvoteComment = async (c: Context) => {
  const user = c.get("user");
  if (!user || !user.id) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { commentId } = c.req.valid("param");

  const { count, isUpvoted } = await upvoteCommentService({
    commentId,
    userId: user.id,
  });

  return c.json<SuccessResponse<{ count: number; isUpvoted: boolean }>>(
    {
      success: true,
      message: "Comment upvoted successfully",
      data: { count, isUpvoted },
    },
    200
  );
};

export const getPaginatedComments = async (c: Context) => {
  const { limit, page, sortBy, order, author, site } = c.req.valid("query");
  const { commentId } = c.req.valid("param");

  const user = c.get("user");

  const { comments, totalCount } = await getPaginatedCommentsService({
    limit,
    page,
    order,
    author,
    site,
    sortBy,
    user,
    commentId,
  });

  return c.json<PaginatedResponse<Comment[]>>(
    {
      data: comments as Comment[],
      success: true,
      message: "Comments fetched successfully",
      pagination: {
        page: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    },
    200
  );
};

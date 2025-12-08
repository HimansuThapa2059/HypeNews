import {
  createCommentForPost,
  createPostService,
  getCommentsService,
  getPaginatedPostsService,
  getSpecificPostService,
  upvotePostService,
} from "@/service/post.service";
import {
  type Comment,
  type PaginatedResponse,
  type Post,
  type SuccessResponse,
} from "@/shared/types";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const createPost = async (c: Context) => {
  try {
    const user = c.get("user");

    const { title, url, content } = c.req.valid("form");

    const post = await createPostService({
      title,
      url,
      content,
      userId: user.id,
    });

    if (!post) {
      return c.json({ success: false, message: "Failed to create post" }, 500);
    }

    return c.json<SuccessResponse<{ postId: number }>>(
      {
        success: true,
        message: "Post created successfully",
        data: { postId: post.id },
      },
      201
    );
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: "Server error" }, 500);
  }
};

export const getPaginatedPosts = async (c: Context) => {
  try {
    const { limit, page, sortBy, order, author, site } = c.req.valid("query");

    const user = c.get("user");

    const { posts, count } = await getPaginatedPostsService({
      limit,
      page,
      order,
      author,
      site,
      sortBy,
      user,
    });

    return c.json<PaginatedResponse<Post[]>>(
      {
        data: posts as Post[],
        success: true,
        message: "Posts fetched successfully",
        pagination: {
          page: page,
          totalPages: Math.ceil(count / limit),
        },
      },
      200
    );
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: "Server error" }, 500);
  }
};

export const upvotePosts = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { postId } = c.req.valid("param");
    const { count, isUpvoted } = await upvotePostService({
      postId,
      userId: user.id,
    });

    return c.json<SuccessResponse<{ count: number; isUpvoted: boolean }>>(
      {
        success: true,
        message: "Post updated successfully",
        data: { count, isUpvoted },
      },
      200
    );
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: "Server error" }, 500);
  }
};

export const createComment = async (c: Context) => {
  const user = c.get("user")!;
  if (!user || !user.id) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { postId } = c.req.valid("param");
  const { content } = c.req.valid("form");

  try {
    const comment = await createCommentForPost(postId, content, user);

    return c.json<SuccessResponse<Comment>>({
      success: true,
      message: "Comment created",
      data: comment,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
};

export const getComments = async (c: Context) => {
  try {
    const user = c.get("user");
    const { postId } = c.req.valid("param");
    const { limit, page, sortBy, order, includeChildren } =
      c.req.valid("query");

    const { comments, count } = await getCommentsService({
      limit,
      page,
      order,
      sortBy,
      user,
      includeChildren,
      postId,
    });

    return c.json<PaginatedResponse<Comment[]>>(
      {
        success: true,
        message: "Comments fetched",
        data: comments as Comment[],
        pagination: {
          page,
          totalPages: Math.ceil(count / limit) as number,
        },
      },
      200
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
};

export const getSpecificPost = async (c: Context) => {
  try {
    const user = c.get("user");

    const { postId } = c.req.valid("param");

    const post = await getSpecificPostService({ user, postId });

    return c.json<SuccessResponse<Post>>(
      {
        success: true,
        message: "Post Fetched successfully",
        data: post as Post,
      },
      200
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
};

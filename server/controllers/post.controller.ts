import {
  createPostService,
  getPaginatedPostsService,
  upvotePostService,
} from "@/service/post.service";
import {
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

import { hc } from "hono/client";
import type {
  ApiRoutes,
  ErrorResponse,
  Order,
  SortBy,
  PaginatedResponse,
  Post,
  SuccessResponse,
  Comment,
} from "@/shared/types";

const client = hc<ApiRoutes>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
}).api;

export const getPosts = async ({
  pageParam = 1,
  pagination,
}: {
  pageParam: number;
  pagination: {
    sortBy?: SortBy;
    order?: Order;
    author?: string;
    site?: string;
  };
}): Promise<PaginatedResponse<Post[]>> => {
  const res = await client.posts.$get({
    query: {
      page: pageParam.toString(),
      sortBy: pagination.sortBy,
      order: pagination.order,
      author: pagination.author,
      site: pagination.site,
    },
  });

  if (!res.ok) {
    const data = (await res.json()) as unknown as ErrorResponse;
    throw new Error(data.error);
  }
  const data = (await res.json()) as PaginatedResponse<Post[]>;
  return data;
};

export const upvotePost = async (postId: string) => {
  const res = await client.posts[":postId"].upvote.$post({
    param: {
      postId,
    },
  });
  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse;
    throw new Error(data.error);
  }
  const data = await res.json();
  return data;
};

export const createPost = async (
  title: string,
  url: string | null,
  content: string | null
) => {
  try {
    const res = await client.posts.$post({
      form: {
        title,
        url,
        content,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    const data = (await res.json()) as ErrorResponse;
    return data;
  } catch (e) {
    return {
      success: false,
      error: String(e),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const getPost = async (postId: number) => {
  const res = await client.posts[":postId"].$get({
    param: {
      postId: postId.toString(),
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data as SuccessResponse<Post>;
  } else {
    // TODO: need to show not found page for not found posts
    // if (res.status === 404) {
    //   throw notFound();
    // }
    const data = (await res.json()) as ErrorResponse;
    throw new Error(data.error);
  }
};

export async function getComments(
  postId: number,
  page: number = 1,
  limit: number = 10,
  pagination: {
    sortBy?: SortBy;
    order?: Order;
  }
) {
  const res = await client.posts[":postId"].comments.$get({
    param: {
      postId: postId.toString(),
    },
    query: {
      page: page.toString(),
      limit: limit.toString(),
      includeChildren: "true",
      sortBy: pagination.sortBy,
      order: pagination.order,
    },
  });

  if (res.ok) {
    const data = await res.json();
    return data as PaginatedResponse<Comment[]>;
  } else {
    const data = (await res.json()) as ErrorResponse;
    throw new Error(data.error);
  }
}

export const getCommentComments = async (
  commentId: number,
  page: number = 1,
  limit: number = 2
) => {
  const res = await client.comments[":commentId"].comments.$get({
    param: {
      commentId: commentId.toString(),
    },
    query: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data as PaginatedResponse<Comment[]>;
  } else {
    const data = (await res.json()) as ErrorResponse;
    throw new Error(data.error);
  }
};

export const upvoteComment = async (commentId: string) => {
  // await new Promise((r) => setTimeout(r, 3000));
  // throw new Error("error");
  const res = await client.comments[":commentId"].upvote.$post({
    param: {
      commentId: commentId,
    },
  });

  if (res.ok) {
    return await res.json();
  }
  const data = (await res.json()) as ErrorResponse;
  throw Error(data.error);
};

export const postComment = async (
  id: number,
  content: string,
  isNested?: boolean
) => {
  try {
    const res = isNested
      ? await client.comments[":commentId"].$post({
          form: {
            content,
          },
          param: {
            commentId: id.toString(),
          },
        })
      : await client.posts[":postId"].comment.$post({
          form: {
            content,
          },
          param: {
            postId: id.toString(),
          },
        });

    if (res.ok) {
      return await res.json();
    }
    const data = (await res.json()) as ErrorResponse;
    return data;
  } catch (e) {
    return {
      success: false,
      error: String(e),
      isFormError: false,
    } as ErrorResponse;
  }
};

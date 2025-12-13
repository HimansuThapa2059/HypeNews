import { hc } from "hono/client";
import type {
  ApiRoutes,
  ErrorResponse,
  Order,
  SortBy,
  PaginatedResponse,
  Post,
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
    const data = (await res.json()) as unknown as ErrorResponse;
    throw new Error(data.error);
  }
  const data = await res.json();
  return data;
};

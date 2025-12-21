import { insertCommentsSchema } from "../server/lib/db/schema/comment-schema";

import z from "zod";

export type { ApiRoutes } from "../server/routes";

export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
  success: false;
  error: string;
  isFormError?: boolean;
};

export const createPostSchema = z
  .object({
    title: z
      .string({ error: "Please enter a title" })
      .min(3, { error: "Title should be at least 3 characters" }),
    url: z.string().refine((v) => v === "" || z.url().safeParse(v).success, {
      message: "Please enter a valid URL",
    }),
    content: z.string(),
  })
  .superRefine((data, ctx) => {
    const hasUrl = data.url.trim() !== "";
    const hasContent = data.content.trim() !== "";

    if (hasUrl === hasContent) {
      ctx.addIssue({
        path: ["url"],
        message: "You must provide either a URL or content, but not both",
        code: "custom",
      });
      ctx.addIssue({
        path: ["content"],
        message: "You must provide either a URL or content, but not both",
        code: "custom",
      });
    }
  });

export type createPostSchemaType = z.infer<typeof createPostSchema>;

export const sortBySchema = z.enum(["points", "recent"]);
export const orderSchema = z.enum(["asc", "desc"]);

export type SortBy = z.infer<typeof sortBySchema>;
export type Order = z.infer<typeof orderSchema>;

export const paginationSchema = z.object({
  limit: z.coerce
    .number()
    .optional()
    .default(10)
    .refine((val) => !isNaN(val), "Must be a valid number"),

  page: z.coerce
    .number()
    .optional()
    .default(1)
    .refine((val) => !isNaN(val), "Must be a valid number"),

  sortBy: sortBySchema.optional().default("points"),
  order: orderSchema.optional().default("desc"),
  author: z.string().optional(),
  site: z.string().optional(),
});

export type paginationType = z.infer<typeof paginationSchema>;

export type Post = {
  id: number;
  title: string;
  url: string | null;
  content: string | null;
  points: number;
  createdAt: string;
  commentCount: number;
  author: {
    id: string;
    name: string;
  } | null;
  isUpvoted: boolean;
};

export type PaginatedResponse<T> = {
  pagination: {
    page: number;
    totalPages: number;
  };
  data: T;
} & Omit<SuccessResponse, "data">;

export const createCommentSchema = insertCommentsSchema.pick({ content: true });

export type Comment = {
  id: number;
  userId: string;
  content: string;
  points: number;
  depth: number;
  commentCount: number;
  createdAt: string;
  postId: number;
  parentCommentId: number | null;
  commentUpvotes: {
    userId: string;
  }[];
  author: {
    name: string;
    id: string;
  } | null;
  childComments?: Comment[];
};

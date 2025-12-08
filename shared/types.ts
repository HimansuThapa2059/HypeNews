import { insertCommentsSchema } from "@/lib/db/schema/comment-schema";
import { insertPostSchema } from "@/lib/db/schema/post-schema";
import z from "zod";

export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type errorResponse = {
  success: false;
  error: string;
  isFormError?: boolean;
};

export const createPostSchema = insertPostSchema
  .pick({
    url: true,
    title: true,
    content: true,
  })
  .refine((data) => data.url || data.content, {
    error: "A post must have either a URL or content",
    path: ["url", "content"],
  });
export type createPostSchemaType = z.infer<typeof createPostSchema>;

export const sortBySchema = z.enum(["points", "recent"]);
export const orderSchema = z.enum(["asc", "desc"]);

export type SortBy = z.infer<typeof sortBySchema>;
export type Order = z.infer<typeof orderSchema>;

export const paginationSchema = z.object({
  limit: z
    .number()
    .optional()
    .default(10)
    .refine((val) => !isNaN(val), "Must be a valid number"),
  page: z
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
    username: string;
    id: string;
  } | null;
  childComments?: Comment[];
};

import { orderSchema, sortBySchema } from "@/shared/types";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const postSearchSchema = z.object({
  id: z.number().default(0),
  sortBy: sortBySchema.optional().default("points"),
  order: orderSchema.optional().default("desc"),
});

export type PostSearchParams = z.infer<typeof postSearchSchema>;
export const defaultPostSearchParams: PostSearchParams = postSearchSchema.parse(
  {}
);

export const Route = createFileRoute("/post")({
  component: RouteComponent,
  validateSearch: (s) => postSearchSchema.parse(s),
});

function RouteComponent() {
  return <div>Hello post!</div>;
}

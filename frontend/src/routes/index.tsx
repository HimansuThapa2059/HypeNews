import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SortBar } from "@/components/sortBar";
import { getPosts } from "@/lib/api";
import { orderSchema, sortBySchema } from "@/shared/types";
import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import z from "zod";
import { PostCard } from "@/components/postCard";
import { Button } from "@/components/ui/button";
import { useUpvotePost } from "@/lib/api-hooks";

type GetPostsReturnType = Awaited<ReturnType<typeof getPosts>>;

const emptyToUndefined = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const homeSearchSchema = z.object({
  sortBy: sortBySchema.default("recent"),
  order: orderSchema.default("desc"),
  author: emptyToUndefined,
  site: emptyToUndefined,
});

export type HomeSearchParams = z.infer<typeof homeSearchSchema>;

export const defaultHomeSearchParams: HomeSearchParams = homeSearchSchema.parse(
  {}
);

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: (s) => homeSearchSchema.parse(s),
});

const postsInfiniteQueryOptions = ({
  sortBy,
  order,
  author,
  site,
}: HomeSearchParams) =>
  infiniteQueryOptions({
    queryKey: ["posts", sortBy, order, author, site],
    queryFn: ({ pageParam }) =>
      getPosts({
        pageParam,
        pagination: { sortBy, order, author, site },
      }),
    initialPageParam: 1,
    staleTime: Infinity,
    getNextPageParam: (lastPage: GetPostsReturnType, _, lastPageParam) =>
      lastPage.pagination.totalPages <= lastPageParam
        ? undefined
        : lastPageParam + 1,
  });

function HomeComponent() {
  const { sortBy, order, author, site } = Route.useSearch();
  const upvoteMutation = useUpvotePost();

  return (
    <div className="mx-auto w-full">
      <SortBar sortBy={sortBy} order={order} />

      <Suspense
        fallback={
          <div className="space-y-4 mt-4">
            {[...Array(5)].map((_, i) => (
              <PostCard key={i} loading />
            ))}
          </div>
        }
      >
        <HomeContent
          sortBy={sortBy}
          order={order}
          author={author}
          site={site}
          upvoteMutation={upvoteMutation}
        />
      </Suspense>
    </div>
  );
}

function HomeContent({
  sortBy,
  order,
  author,
  site,
  upvoteMutation,
}: HomeSearchParams & { upvoteMutation: ReturnType<typeof useUpvotePost> }) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      postsInfiniteQueryOptions({ sortBy, order, author, site })
    );

  return (
    <>
      <div className="space-y-4 mt-4">
        {data.pages.map((page) =>
          page.data.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpvote={() => upvoteMutation.mutate(post.id.toString())}
            />
          ))
        )}
      </div>

      <div className="mt-6 text-center">
        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? "Load more"
              : "Nothing more"}
        </Button>
      </div>
    </>
  );
}

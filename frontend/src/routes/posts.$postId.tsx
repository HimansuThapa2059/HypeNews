import { CommentCard } from "@/components/commentCard";
import { PostCard } from "@/components/postCard";
import { SortBar } from "@/components/sortBar";
import { Card, CardContent } from "@/components/ui/card";
import { getComments, getPost } from "@/lib/api";
import { useUpvotePost } from "@/lib/api-hooks";
import { orderSchema, sortBySchema } from "@/shared/types";
import {
  infiniteQueryOptions,
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";

const postSearchSchema = z.object({
  sortBy: sortBySchema.optional().default("points"),
  order: orderSchema.optional().default("desc"),
});

type GetPostsReturnType = Awaited<ReturnType<typeof getComments>>;

export type PostSearchParams = z.infer<typeof postSearchSchema>;
export const defaultPostSearchParams: PostSearchParams = postSearchSchema.parse(
  {}
);
const postQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    staleTime: Infinity,
    retry: false,
    throwOnError: true,
  });

const commentsInfiniteQueryOptions = ({
  postId,
  sortBy,
  order,
}: z.infer<typeof postSearchSchema> & { postId: number }) =>
  infiniteQueryOptions({
    queryKey: ["comments", postId, sortBy, order],
    queryFn: ({ pageParam }) =>
      getComments(postId, pageParam, 10, { sortBy, order }),
    initialPageParam: 1,
    staleTime: Infinity,
    retry: false,
    getNextPageParam: (
      lastPage: GetPostsReturnType,
      allPages,
      lastPageParam
    ) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

export const Route = createFileRoute("/posts/$postId")({
  component: RouteComponent,
  validateSearch: (s) => postSearchSchema.parse(s),
  params: {
    parse: (params) => {
      const postId = Number(params.postId);
      return Number.isInteger(postId) && postId > 0
        ? { postId }
        : { postId: NaN };
    },
  },
});

function RouteComponent() {
  const { order, sortBy } = Route.useSearch();
  const [activeReplayId, setActiveReplayId] = useState<number | null>(null);

  const { postId } = Route.useParams();
  if (!Number.isInteger(postId)) {
    return <p>invalid postid</p>;
  }

  const { data } = useSuspenseQuery(postQueryOptions(Number(postId)));
  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    commentsInfiniteQueryOptions({ order, sortBy, postId })
  );
  const upvotePost = useUpvotePost();

  return (
    <>
      <div className="mt-2">
        {data && (
          <PostCard
            post={data.data}
            onUpvote={() => upvotePost.mutate(postId.toString())}
          />
        )}
      </div>

      <div className="my-2">
        {comments && comments.pages[0].data.length > 0 && (
          <h2 className="mb-2 text-lg font-semibold text-foreground pl-1.5">
            Comments
          </h2>
        )}
        {comments && comments.pages[0].data.length > 0 && (
          <SortBar sortBy={sortBy} order={order} />
        )}
      </div>
      {comments && comments.pages[0].data.length > 0 && (
        <Card className="py-4">
          <CardContent>
            {comments.pages.map((page) =>
              page.data.map((comment, i) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  activeReplyId={activeReplayId}
                  setActiveReplyId={setActiveReplayId}
                  isLast={i === page.data.length - 1}
                  toggleUpvote={() => {
                    console.log("upvoted");
                  }}
                />
              ))
            )}
            {hasNextPage && (
              <div className="mt-2">
                <button
                  className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <ChevronDownIcon size={12} />
                      <span className="cursor-pointer">More replies</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

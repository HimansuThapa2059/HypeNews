import { cn } from "@/lib/utils";
import { Comment } from "@/shared/types";
import { relativeTime } from "@/utils/utils";
import { useSession } from "@/lib/auth";
import {
  ChevronDown,
  ChevronDownIcon,
  ChevronUp,
  ChevronUpIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useState } from "react";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { getCommentComments } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { defaultHomeSearchParams } from "@/routes";
import { Separator } from "./ui/separator";
import { useUpvoteComment } from "@/lib/api-hooks";
import { CommentForm } from "./commentForm";

type GetCommentCommentsReturnType = Awaited<
  ReturnType<typeof getCommentComments>
>;

type CommentCardProps = {
  comment: Comment;
  depth: number;
  activeReplyId: number | null;
  setActiveReplyId: React.Dispatch<React.SetStateAction<number | null>>;
  isLast: boolean;
  toggleUpvote: ReturnType<typeof useUpvoteComment>["mutate"];
};

export function CommentCard({
  comment,
  depth,
  activeReplyId,
  isLast,
  setActiveReplyId,
  toggleUpvote,
}: CommentCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const queryClient = useQueryClient();

  const user = useSession().data?.user;

  const isUpvoted = comment.commentUpvotes?.length > 0;

  const isReplying = activeReplyId === comment.id;

  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: ["comments", "comment", comment.id],
    queryFn: ({ pageParam }) => getCommentComments(comment.id, pageParam),
    initialPageParam: 1,
    staleTime: Infinity,
    initialData: {
      pageParams: [1],
      pages: [
        {
          success: true as const,
          message: "Comments fetched",
          data: comment.childComments ?? [],
          pagination: {
            page: 1,
            totalPages: Math.ceil(comment.commentCount / 2),
          },
        },
      ],
    },

    getNextPageParam: (
      lastPage: GetCommentCommentsReturnType,
      _,
      lastPageParam
    ) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

  const loadFirstPage =
    comments?.pages[0].data?.length === 0 && comment.commentCount > 0;

  const isDraft = comment.id === -1;

  return (
    <div
      className={cn(
        depth > 0 && "ml-4 border-l border-border pl-4",
        isDraft && "pointer-events-none opacity-50"
      )}
    >
      <div className="py-2">
        <div className="mb-2 flex items-center space-x-1 text-xs">
          <button
            className={cn(
              "flex items-center space-x-1 cursor-pointer hover:text-primary",
              isUpvoted ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() =>
              toggleUpvote({
                id: comment.id.toString(),
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
              })
            }
          >
            <ChevronUpIcon size={14} />
            <span className="font-medium">{comment.points}</span>
          </button>

          <span className="text-muted-foreground">·</span>
          <Link
            className="hover:underline ml-1"
            to="/"
            search={{
              ...defaultHomeSearchParams,
              author: comment.author?.id || "",
            }}
          >
            {comment.author?.name || "deleted user"}
          </Link>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {relativeTime(comment.createdAt)}
          </span>
          <span className="text-muted-foreground">·</span>
          <button
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        {!isCollapsed && (
          <>
            <p className="mb-2 text-sm text-foreground">{comment.content}</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {user && (
                <button
                  className="flex items-center space-x-1 hover:text-foreground cursor-pointer"
                  onClick={() =>
                    setActiveReplyId(isReplying ? null : comment.id)
                  }
                >
                  <MessageSquareIcon size={12} />
                  <span>reply</span>
                </button>
              )}
            </div>
            {isReplying && (
              <div className="mt-2.5">
                <CommentForm
                  id={comment.id}
                  isParent
                  key={comment.id}
                  onSuccess={() => setActiveReplyId(null)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {!isCollapsed &&
        comments &&
        comments.pages.map((page, index) => {
          const isLastPage = index === comments.pages.length - 1;
          return page.data.map((reply, index) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              isLast={isLastPage && index === page.data.length - 1}
              toggleUpvote={toggleUpvote}
            />
          ));
        })}

      {!isCollapsed && (hasNextPage || loadFirstPage) && (
        <div className="mt-2">
          <button
            className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (loadFirstPage) {
                queryClient.invalidateQueries({
                  queryKey: ["comments", "comment", comment.id],
                });
              } else {
                fetchNextPage();
              }
            }}
            disabled={!(hasNextPage || loadFirstPage) || isFetchingNextPage}
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

      {!isLast && <Separator className="my-2" />}
    </div>
  );
}

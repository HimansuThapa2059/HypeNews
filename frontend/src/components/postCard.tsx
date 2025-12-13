import { Post } from "@/shared/types";
import { Card, CardContent, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth";
import { ChevronUpIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { defaultHomeSearchParams } from "@/routes";
import { badgeVariants } from "./ui/badge";
import { getHostname, relativeTime } from "@/utils/utils";
import { defaultPostSearchParams } from "@/routes/post";

export const PostCard = ({
  post,
  onUpvote,
  loading = false,
}: {
  post?: Post;
  onUpvote?: (postId: number) => void;
  loading?: boolean;
}) => {
  const user = useSession().data?.user;
  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col items-center w-10 gap-2">
            <div className="h-4 w-4 skeleton" />
            <div className="h-3 w-6 skeleton" />
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <div className="h-5 w-2/3 skeleton" />
            <div className="h-4 w-24 skeleton" />

            <div className="h-4 w-full skeleton" />
            <div className="h-4 w-5/6 skeleton" />

            <div className="flex gap-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-3 w-12 skeleton" />
              <div className="h-3 w-16 skeleton" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!post) return null;

  return (
    <Card className="p-4">
      <div className="flex flex-row gap-4">
        <button
          onClick={() => onUpvote?.(post.id)}
          disabled={!user}
          className={cn(
            "w-10 flex flex-col items-center justify-center text-muted-foreground hover:text-primary cursor-pointer",
            post.isUpvoted && "text-primary",
            !user && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronUpIcon size={20} />
          <span className="text-xs font-medium">{post.points}</span>
        </button>

        <div className="flex flex-col flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2">
            <CardTitle className="text-lg font-semibold leading-tight">
              {post.url ? (
                <a
                  href={post.url}
                  className="hover:underline hover:text-primary"
                >
                  {post.title}
                </a>
              ) : (
                <Link
                  to="/"
                  search={defaultHomeSearchParams}
                  className="hover:underline hover:text-primary"
                >
                  {post.title}
                </Link>
              )}
            </CardTitle>

            {post.url && (
              <Link
                to="/"
                search={{ ...defaultHomeSearchParams, site: post.url }}
                className={cn(
                  badgeVariants({ variant: "secondary" }),
                  "cursor-pointer text-xs font-normal hover:bg-primary/80 hover:underline"
                )}
              >
                {getHostname(post.url)}
              </Link>
            )}
          </div>

          <CardContent className="p-0">
            {post.content && (
              <p className="mb-2 text-sm text-foreground">{post.content}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
              <span>
                by
                <Link
                  className="hover:underline ml-1"
                  to="/"
                  search={{
                    ...defaultHomeSearchParams,
                    author: post.author?.id || "",
                  }}
                >
                  {post.author?.username || "k ho"}
                </Link>
              </span>
              <span>·</span>
              <span>{relativeTime(post.createdAt)}</span>
              <span>·</span>
              <Link
                to="/post"
                search={{ ...defaultPostSearchParams, id: post.id }}
                className="hover:underline"
              >
                {post.commentCount} comments
              </Link>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

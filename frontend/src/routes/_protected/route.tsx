import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_protected")({
  component: ProtectedRoute,
});

function ProtectedRoute() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center space-y-4 px-4">
        <h2 className="text-2xl font-semibold">You’re not signed in</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to create a post and join the discussion.
        </p>
        <Button
          onClick={() =>
            navigate({
              to: "/auth/login",
              search: { redirect: "/create-post" },
            })
          }
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Outlet />
    </div>
  );
}

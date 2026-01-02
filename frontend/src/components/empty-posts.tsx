import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

const EmptyPosts = () => {
  return (
    <div className="mt-20 flex flex-col items-center text-center text-muted-foreground">
      <FileText className="mb-4 h-10 w-10 opacity-60" />

      <h2 className="text-lg font-semibold text-foreground">
        Nothing here yet 👋
      </h2>

      <p className="mt-1 max-w-md text-sm">
        Be the first to share something with the community.
      </p>

      <Button asChild variant="brand" className="mt-6">
        <Link to="/submit">Create your first post</Link>
      </Button>
    </div>
  );
};

export default EmptyPosts;

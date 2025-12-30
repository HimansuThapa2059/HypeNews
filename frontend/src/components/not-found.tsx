import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { defaultHomeSearchParams } from "@/routes";

export function NotFound() {
  return (
    <div className="flex mt-20 flex-col items-center justify-center p-4 text-center">
      <p className="text-7xl font-extrabold text-primary mb-4">404</p>
      <p className="text-2xl font-semibold mb-2">Oops! Page not found.</p>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild variant="brand" size="lg">
        <Link to="/" search={defaultHomeSearchParams}>
          Go Back Home
        </Link>
      </Button>
    </div>
  );
}

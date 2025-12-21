import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { authClient, useSession } from "@/lib/auth";
import { toast } from "sonner";
import { formatName } from "@/utils/utils";
import { defaultHomeSearchParams } from "@/routes";
import Logo from "./logos/logo";

const Header = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const user = useSession().data?.user;

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      toast.success("Logged out successfully", {
        description: "You have been logged out. See you soon!",
      });

      navigate({ to: "/auth/login", search: { redirect: "" } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Logout failed", {
        description:
          error.message ||
          "There was an issue logging you out. Please try again.",
      });
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-primary backdrop-blur supports-backdrop-filter:bg-primary/90">
      <div className="max-container flex items-center justify-between p-2.5 sm:p-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            search={defaultHomeSearchParams}
            className="text-xl sm:text-2xl font-bold flex items-center gap-x-1"
          >
            <Logo className="size-7" />

            <span>HypeNews</span>
          </Link>
          <nav className="hidden items-center space-x-4 md:flex ml-5 tracking-wide font-medium">
            <Link
              to={"/"}
              search={defaultHomeSearchParams}
              className="hover:underline"
            >
              new
            </Link>
            <Link
              to={"/"}
              search={defaultHomeSearchParams}
              className="hover:underline"
            >
              top
            </Link>
            <Link
              to="/"
              search={defaultHomeSearchParams}
              className="hover:underline"
            >
              submit
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center ml-4 gap-6">
          {user ? (
            <>
              <Link
                to="/"
                search={{
                  author: "",
                  site: "",
                  order: "desc",
                  sortBy: "recent",
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-foreground text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-semibold max-w-[20ch] truncate">
                  {formatName(user.name)}
                </span>
              </Link>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="h-6 sm:h-8 cursor-pointer"
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-6 sm:h-8 cursor-pointer"
            >
              <Link to="/auth/login" search={{ redirect: "" }}>
                Log in
              </Link>
            </Button>
          )}
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="md:hidden cursor-pointer"
            >
              <MenuIcon className="size-5 sm:size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-64 py-6 px-4 bg-white dark:bg-gray-900 shadow-xl">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                HypeNews
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigation
              </SheetDescription>
            </SheetHeader>

            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            <nav className="flex flex-col space-y-1 mt-">
              <Link
                to="/"
                search={{
                  author: "",
                  site: "",
                  order: "desc",
                  sortBy: "recent",
                }}
                className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-gray-800 dark:text-gray-200"
                onClick={() => setIsOpen(false)}
              >
                New
              </Link>
              <Link
                to="/"
                search={{
                  author: "",
                  site: "",
                  order: "desc",
                  sortBy: "recent",
                }}
                className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-gray-800 dark:text-gray-200"
                onClick={() => setIsOpen(false)}
              >
                Top
              </Link>
              <Link
                to="/"
                search={{
                  author: "",
                  site: "",
                  order: "desc",
                  sortBy: "recent",
                }}
                className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-gray-800 dark:text-gray-200"
                onClick={() => setIsOpen(false)}
              >
                Submit
              </Link>

              <div className="mt-4 border-t border-gray-200 dark:border-gray-700"></div>

              {user ? (
                <div className="mt-4 space-y-4">
                  <Link
                    to="/"
                    search={{
                      author: "",
                      site: "",
                      order: "desc",
                      sortBy: "recent",
                    }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary-foreground text-primary-foreground flex items-center justify-center font-semibold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">
                        {formatName(user.name)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Logged in
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="brand"
                    className="w-full cursor-pointer"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="mt-4 pt-4">
                  <Button
                    asChild
                    variant="brand"
                    className="w-full cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/auth/login" search={{ redirect: "" }}>
                      Log in
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;

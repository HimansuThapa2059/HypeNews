import React from "react";
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import Header from "@/components/header";
import { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

interface RouterContext {
  queryClient: QueryClient;
}

export const DevTools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        Promise.all([
          import("@tanstack/react-router-devtools"),
          import("@tanstack/react-query-devtools"),
        ]).then(([router, query]) => ({
          default: () => (
            <>
              <router.TanStackRouterDevtools position="bottom-left" />
              <query.ReactQueryDevtools
                position="top"
                buttonPosition="bottom-left"
              />
            </>
          ),
        }))
      );

function RootComponent() {
  const { location } = useRouterState();

  const isAuthPage = location.pathname.startsWith("/auth");

  return (
    <>
      <div className="flex min-h-dvh flex-col text-foreground">
        {!isAuthPage && <Header />}

        <main
          className={`max-container grow p-4 md:px-6 ${
            isAuthPage ? "flex items-center justify-center" : ""
          }`}
        >
          <Outlet />
        </main>

        {!isAuthPage && (
          <footer className="border-t py-4">
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-3">
              <span>Made with 💜 by Himansu Thapa</span>
              <span className="opacity-40">•</span>
              <a
                href="https://github.com/HimansuThapa2059/hypenews"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                View on GitHub
              </a>
            </div>
          </footer>
        )}
      </div>

      <DevTools />
    </>
  );
}

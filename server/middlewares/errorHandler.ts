import type { ErrorResponse } from "@/shared/types";
import type { Context, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      message: `Not Found - [${c.req.method}]:[${c.req.url}]`,
    },
    404
  );
};

export function errorHandler(err: unknown, c: Context) {
  if (err instanceof HTTPException) {
    if (err.res) return err.res;

    const isFormError =
      typeof err.cause === "object" &&
      err.cause !== null &&
      "form" in err.cause &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err.cause as any).form === true;

    return c.json<ErrorResponse>(
      {
        success: false,
        error: err.message,
        isFormError,
      },
      err.status
    );
  }

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((err as any).stack ?? String(err));

  return c.json<ErrorResponse>({ success: false, error: message }, 500);
}

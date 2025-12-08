import type { Context, Next } from "hono";

export const requireAuth = async (c: Context, next: Next) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }
  await next();
};

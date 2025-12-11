import { Hono } from "hono";
import rootRouter from "./root.route";
import postRouter from "./post.route";
import commentRouter from "./comment.route";
import { auth } from "@/lib/auth";

const routes = new Hono()
  .route("/", rootRouter)
  .route("/api/posts", postRouter)
  .route("/api/comments", commentRouter)
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default routes;
export type ApiRoutes = typeof routes;

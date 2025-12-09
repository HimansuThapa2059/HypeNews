import { Hono } from "hono";
import rootRouter from "./root.route";
import postRouter from "./post.route";
import commentRouter from "./comment.route";

const routes = new Hono();

routes.route("/", rootRouter);
routes.route("/api/posts", postRouter);
routes.route("/api/comments", commentRouter);

export default routes;

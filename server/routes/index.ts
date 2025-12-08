import { Hono } from "hono";
import rootRouter from "./root.route";
import postRouter from "./post.route";

const routes = new Hono();

routes.route("/", rootRouter);
routes.route("/api/posts", postRouter);

export default routes;

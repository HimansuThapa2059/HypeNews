import { Hono } from "hono";

const rootRouter = new Hono();

rootRouter.get("/", (c) =>
  c.text("Hey there 👋! Welcome to hono api for HyperNews")
);

export default rootRouter;

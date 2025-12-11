import { Hono } from "hono";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import routes from "./routes";
import { cors } from "hono/cors";
import { attachUser } from "./middlewares/attachUser";

const app = new Hono();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ---- Attach User To Hono Context ----
app.use(attachUser);

// ---- routes ----
app.route("/", routes);

// ---- Middlewares ----
app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;

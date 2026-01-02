import { Hono } from "hono";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import routes from "./routes";
import { cors } from "hono/cors";
import { attachUser } from "./middlewares/attachUser";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ---- Attach User To Hono Context ----
app.use(attachUser);

// ---- routes ----
app.route("/", routes);

// 2. Explicitly serve static assets from the React build directory
// This ensures .js, .css, .webmanifest, and images are found
app.use("/*", serveStatic({ root: "./frontend/dist" }));

// 3. Fallback for Single Page Application (SPA)
// If the request isn't a file (like /about or /login), serve index.html
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

// ---- Middlewares ----
app.notFound(notFoundHandler);
app.onError(errorHandler);

export default {
  port: process.env["PORT"] || 3000,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};

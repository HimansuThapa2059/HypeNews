import {
  getPaginatedComments,
  replayComment,
  upvoteComment,
} from "@/controllers";
import { requireAuth } from "@/middlewares/requireAuth";
import { paginationSchema } from "@/shared/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

const commentRouter = new Hono()
  .post(
    "/:commentId",
    requireAuth,
    zValidator("param", z.object({ commentId: z.coerce.number() })),
    zValidator("form", z.object({ content: z.string() })),
    replayComment
  )
  .post(
    "/:commentId/upvote",
    requireAuth,
    zValidator("param", z.object({ commentId: z.coerce.number() })),
    upvoteComment
  )
  .get(
    "/:commentId/comments",
    zValidator("param", z.object({ commentId: z.coerce.number() })),
    zValidator("query", paginationSchema),
    getPaginatedComments
  );

export default commentRouter;
export type CommentRoutes = typeof commentRouter;

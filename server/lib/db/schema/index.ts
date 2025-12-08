import * as authSchema from "./auth-schema";
import * as commentSchema from "./comment-schema";
import * as postSchema from "./post-schema";
import * as upvoteSchema from "./upvote-schema";

export const schema = {
  ...authSchema,
  ...commentSchema,
  ...postSchema,
  ...upvoteSchema,
};

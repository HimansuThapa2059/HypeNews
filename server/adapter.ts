import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
});

const processEnv = EnvSchema.parse(process.env);

const queryClient = postgres(processEnv.DATABASE_URL);

const db = drizzle(queryClient);
const result = await db.execute("");
console.log(result);

// export const db = drizzle(queryClient, {
//   schema: {
//     user: userTable,
//     session: sessionTable,
//     posts: postsTable,
//     comments: commentsTable,
//     postUpvotes: postUpvotesTable,
//     commentUpvoted: commentUpvotesTable,
//     postsRelations,
//     commentUpvoteRelations,
//     postUpvoteRelations,
//     userRelations,
//     commentRelations,
//   },
// });

// export const adapter = new DrizzlePostgreSQLAdapter(
//   db,
//   sessionTable,
//   userTable
// );

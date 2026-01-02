// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import { z } from "zod";
// import { schema } from "./schema";

// const EnvSchema = z.object({
//   DATABASE_URL: z.url(),
// });

// const env = EnvSchema.parse(process.env);

// const client = postgres(env.DATABASE_URL);

// export const db = drizzle(client, { schema });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { schema } from "./schema";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const env = EnvSchema.parse(process.env);

export const db =
  env.NODE_ENV === "production"
    ? drizzleNeon(neon(env.DATABASE_URL), { schema })
    : drizzle(postgres(env.DATABASE_URL), { schema });

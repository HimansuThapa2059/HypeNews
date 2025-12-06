import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { schema } from "./schema";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
});

const env = EnvSchema.parse(process.env);

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

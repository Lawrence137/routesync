import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./auth-schema";
import * as appSchema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export const db = drizzle(databaseUrl, {
  schema: {
    ...authSchema,
    ...appSchema,
  },
});
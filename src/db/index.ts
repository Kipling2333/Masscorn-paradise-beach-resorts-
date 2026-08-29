import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Force fetch connection mode to prevent serverless execution hangs
neonConfig.fetchConnectionCache = true;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required in your environment variables.");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
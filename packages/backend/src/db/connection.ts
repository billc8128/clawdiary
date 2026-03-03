import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { getEnv } from "../config.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const env = getEnv();
    const client = postgres(env.DATABASE_URL, { max: 10 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

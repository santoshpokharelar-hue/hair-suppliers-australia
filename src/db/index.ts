import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

// Reuse the client across hot reloads in dev so we don't exhaust connections.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  drizzleDb?: DrizzleDb;
};

// Connecting (and validating DATABASE_URL) is deferred to first query via the
// Proxy below, rather than happening at module import time. Route modules
// that merely import `db` (e.g. for type inference, or transitively through
// auth.ts) get imported during `next build`'s page-data collection even when
// nothing queries the DB — an eager connection here would fail that build.
function getDb(): DrizzleDb {
  if (!globalForDb.drizzleDb) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env.local and point it at your Supabase Postgres connection string."
      );
    }
    const client = globalForDb.pgClient ?? postgres(connectionString, { prepare: false });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.pgClient = client;
    }
    globalForDb.drizzleDb = drizzle(client, { schema });
  }
  return globalForDb.drizzleDb;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

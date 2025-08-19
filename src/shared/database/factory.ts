import { DatabaseConnection } from "./database";
import { SupabaseAdapter } from "./supabase-adapter";
import { Env } from "@/types";

export function createDatabaseConnection(env: Env): DatabaseConnection {
  const dbType = env.DATABASE_TYPE || "supabase";

  switch (dbType) {
    case "supabase":
      return new SupabaseAdapter(env);
    // case "postgres":
    //   return new PostgresAdapter(env); // Future: direct Postgres connection
    // case "mysql":
    //   return new MySQLAdapter(env); // Future: MySQL connection
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}

import { DatabaseConnection } from "./database";
import { HyperdriveAdapter } from "./hyperdrive-adapter";
import { SupabaseAdapter } from "./supabase-adapter";
import { Env } from "@/types";

export function createDatabaseConnection(env: Env): DatabaseConnection {
  const dbType = env.DATABASE_TYPE || "hyperdrive";

  switch (dbType) {
    case "supabase":
      return new SupabaseAdapter(env);
    case "hyperdrive":
      return new HyperdriveAdapter(env);
    // case "mysql":
    //   return new MySQLAdapter(env); // Future: MySQL connection
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}

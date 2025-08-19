// src/shared/database/supabase-adapter.ts
import { createClient } from "@supabase/supabase-js";
import { DatabaseConnection } from "./database";
import { Env } from "@/types";

export class SupabaseAdapter implements DatabaseConnection {
  private client;

  constructor(env: Env) {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    console.log("🔍 Executing query:", sql);
    console.log("📋 With params:", params);

    try {
      // Handle specific queries differently
      if (
        sql.toLowerCase().includes("select") &&
        sql.toLowerCase().includes("users")
      ) {
        // Use Supabase client directly for users table
        console.log("📊 Using Supabase client for users query");

        if (sql.includes("COUNT(*)")) {
          const { count, error } = await this.client
            .from("users")
            .select("*", { count: "exact", head: true });

          if (error) {
            console.error("❌ Count query error:", error);
            throw error;
          }

          return [{ count }] as T[];
        }

        if (sql.includes("LIMIT") && sql.includes("OFFSET")) {
          // Parse LIMIT and OFFSET from SQL (basic parsing)
          const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
          const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);

          const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
          const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;

          const { data, error } = await this.client
            .from("users")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) {
            console.error("❌ Select query error:", error);
            throw error;
          }

          return data as T[];
        }

        // Simple select all
        const { data, error } = await this.client
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Select all error:", error);
          throw error;
        }

        return data as T[];
      }

      // For schema_migrations queries
      if (sql.toLowerCase().includes("schema_migrations")) {
        console.log("📊 Using Supabase client for schema_migrations");

        const { data, error } = await this.client
          .from("schema_migrations")
          .select("id")
          .order("executed_at");

        if (error) {
          console.error("❌ Schema migrations error:", error);
          // Return empty array if table doesn't exist
          return [];
        }

        return data as T[];
      }

      // For other SQL commands, use exec_sql
      console.log("⚡ Using exec_sql function");
      const { data, error } = await this.client.rpc("exec_sql", {
        sql: sql,
      });

      if (error) {
        console.error("❌ exec_sql error:", error);
        throw error;
      }

      console.log("✅ Query successful");
      return data || [];
    } catch (error) {
      console.error("❌ Query failed:", error);
      throw error;
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(
    sql: string,
    params: any[] = []
  ): Promise<{ rowCount: number }> {
    console.log("🔨 Executing command:", sql);
    console.log("📋 With params:", params);

    try {
      const { error } = await this.client.rpc("exec_sql", {
        sql: sql,
      });

      if (error) {
        console.error("❌ Execute error:", error);
        throw error;
      }

      console.log("✅ Execute successful");
      return { rowCount: 1 };
    } catch (error) {
      console.error("❌ Execute failed:", error);
      throw error;
    }
  }
}

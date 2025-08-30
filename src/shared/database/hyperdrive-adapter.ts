// src/lib/database/hyperdrive-adapter.ts
import postgres from "postgres";
import { Env } from "@/types";
import { DatabaseConnection } from "./database";

export class HyperdriveAdapter implements DatabaseConnection {
  private hyperdrive: Hyperdrive;

  private connectionString: string;

  constructor(env: Env) {
    console.log("Environment:", env.ENVIRONMENT);

    if (env.ENVIRONMENT === "development") {
      // Skip Hyperdrive for local development
      this.connectionString =
        "postgresql://postgres:MyNewPass786@db.zmlnqmzdjpiyxytnlqji.supabase.co:5432/postgres";
      console.log("Using direct connection for development");
    } else {
      // Use Hyperdrive in production
      this.hyperdrive = env.HYPERDRIVE;
      this.connectionString = this.hyperdrive.connectionString;

      console.log("Using Hyperdrive connection for production");
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    console.log("Executing query:", sql);
    console.log("With params:", params);

    const client = postgres(this.connectionString, {
      prepare: false,
      ssl: false,
    });

    try {
      const result = await client.unsafe(sql, params);
      console.log("Query executed successfully, rows:", result.length);
      return result as T[];
    } catch (error: any) {
      console.error("Query failed:", error);
      throw new Error(`Database Error: ${error.message}`);
    } finally {
      await client.end();
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
    console.log("Executing command:", sql);
    console.log("With params:", params);

    const client = postgres(this.connectionString, {
      prepare: false,
      ssl: false,
    });

    try {
      const result = await client.unsafe(sql, params);
      console.log(
        "Command executed successfully, affected rows:",
        result.count
      );
      return { rowCount: result.count || 0 };
    } catch (error: any) {
      console.error("Execute failed:", error);
      throw new Error(`Database Error: ${error.message}`);
    } finally {
      await client.end();
    }
  }

  async beginTransaction(): Promise<HyperdriveTransaction> {
    const client = postgres(this.connectionString, {
      prepare: false,
      ssl: false,
    });

    await client`BEGIN`;
    return new HyperdriveTransaction(client);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.query("SELECT 1 as test");
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  async getDatabaseInfo(): Promise<any> {
    const result = await this.query(`
      SELECT 
        version() as version,
        current_database() as database,
        current_user as "user",
        inet_server_addr() as host,
        inet_server_port() as port
    `);
    return result[0];
  }
}

// Transaction helper class
export class HyperdriveTransaction {
  constructor(private client: postgres.Sql) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const result = await this.client.unsafe(sql, params);
      return result as T[];
    } catch (error: any) {
      console.error("Transaction query failed:", error);
      throw new Error(`Transaction Error: ${error.message}`);
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
    try {
      const result = await this.client.unsafe(sql, params);
      return { rowCount: result.count || 0 };
    } catch (error: any) {
      console.error("Transaction execute failed:", error);
      throw new Error(`Transaction Error: ${error.message}`);
    }
  }

  async commit(): Promise<void> {
    try {
      await this.client`COMMIT`;
      await this.client.end();
    } catch (error: any) {
      console.error("Transaction commit failed:", error);
      throw new Error(`Commit Error: ${error.message}`);
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.client`ROLLBACK`;
      await this.client.end();
    } catch (error: any) {
      console.error("Transaction rollback failed:", error);
      throw new Error(`Rollback Error: ${error.message}`);
    }
  }
}

import { createDatabaseConnection } from "@/shared/database/factory";
import { migrations, Migration } from "./migrations";
import { Env } from "@/types";

export class DatabaseMigrator {
  private db;

  constructor(private env: Env) {
    this.db = createDatabaseConnection(env);
  }

  async runMigrations(): Promise<boolean> {
    try {
      console.log("🔄 Starting database migrations...");

      await this.createMigrationsTable();
      const appliedMigrations = await this.getAppliedMigrations();

      const pendingMigrations = migrations.filter(
        (migration) => !appliedMigrations.includes(migration.id)
      );

      if (pendingMigrations.length === 0) {
        console.log("✅ All migrations are up to date");
        return true;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);

      for (const migration of pendingMigrations) {
        await this.runSingleMigration(migration);
      }

      console.log("✅ All migrations completed successfully");
      return true;
    } catch (error) {
      console.error("❌ Migration failed:", error);
      return false;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    try {
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          "executedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
    } catch (error) {
      throw new Error(`Failed to create migrations table: ${error}`);
    }
  }

  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const results = await this.db.query<{ id: string }>(
        'SELECT id FROM schema_migrations ORDER BY "executedAt"'
      );
      return results.map((row) => row.id);
    } catch (error) {
      // Table might not exist yet
      return [];
    }
  }

  private async runSingleMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Running migration: ${migration.name}`);

    try {
      // Execute migration SQL (remove transaction commands)
      await this.db.execute(migration.up);

      // Record migration
      await this.db.execute(
        "INSERT INTO schema_migrations (id, name) VALUES ($1, $2)",
        [migration.id, migration.name]
      );

      console.log(`✅ Migration completed: ${migration.name}`);
    } catch (error) {
      throw new Error(`Migration ${migration.id} failed: ${error}`);
    }
  }
}

//! For Supabase Migration Need To Run These Commented Query In Supabase SQL Editor
// -- Create the exec_sql function that allows running raw SQL
// CREATE OR REPLACE FUNCTION exec_sql(sql text)
// RETURNS void AS $$
// BEGIN
//   EXECUTE sql;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;

// -- Create a function specifically for migrations that can return data
// CREATE OR REPLACE FUNCTION exec_migration_sql(sql text)
// RETURNS TABLE(result jsonb) AS $$
// BEGIN
//   -- For CREATE/ALTER/INSERT/UPDATE/DELETE statements
//   IF sql ILIKE 'CREATE%' OR sql ILIKE 'ALTER%' OR sql ILIKE 'INSERT%'
//      OR sql ILIKE 'UPDATE%' OR sql ILIKE 'DELETE%' OR sql ILIKE 'DROP%' THEN
//     EXECUTE sql;
//     RETURN QUERY SELECT '{"success": true}'::jsonb;

//   -- For SELECT statements, we need to handle differently
//   ELSE
//     RETURN QUERY EXECUTE sql;
//   END IF;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;

// -- Function for executing SQL commands (already exists)
// CREATE OR REPLACE FUNCTION exec_sql(sql text)
// RETURNS void AS $$
// BEGIN
//   EXECUTE sql;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;

// -- Function for executing SELECT queries that return data
// CREATE OR REPLACE FUNCTION exec_query(sql text)
// RETURNS TABLE(result jsonb) AS $$
// DECLARE
//   rec record;
//   result_array jsonb := '[]'::jsonb;
// BEGIN
//   FOR rec IN EXECUTE sql LOOP
//     result_array := result_array || to_jsonb(rec);
//   END LOOP;

//   RETURN QUERY SELECT jsonb_array_elements(result_array);
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//! For Supabase Migration Need To Run These Commented Query In Supabase SQL Editor

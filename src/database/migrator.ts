import { getSupabaseClient } from "@/shared/database/supabase";
import { migrations, Migration } from "./migrations";
import { Env } from "@/types";

export class DatabaseMigrator {
  private supabase;

  constructor(private env: Env) {
    this.supabase = getSupabaseClient(env);
  }

  async runMigrations(): Promise<boolean> {
    try {
      console.log("🔄 Starting database migrations...");

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get already applied migrations
      const appliedMigrations = await this.getAppliedMigrations();

      // Run pending migrations
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
      // First, try to check if table exists by querying it
      const { error: checkError } = await this.supabase
        .from("schema_migrations")
        .select("id")
        .limit(1);

      // If no error, table exists
      if (!checkError) {
        console.log("📋 Migrations table already exists");
        return;
      }

      // If table doesn't exist (error code 42P01), create it
      if (checkError.code === "42P01") {
        console.log("📋 Creating migrations table...");

        const { error } = await this.supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE schema_migrations (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        });

        if (error) {
          throw new Error(
            `Failed to create migrations table: ${error.message}`
          );
        }

        console.log("✅ Migrations table created");
      } else {
        // Some other error occurred
        throw new Error(
          `Failed to check migrations table: ${checkError.message}`
        );
      }
    } catch (error) {
      throw new Error(`Migration table setup failed: ${error}`);
    }
  }

  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("schema_migrations")
        .select("id");

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist yet, return empty array
          return [];
        }
        throw new Error(`Failed to get applied migrations: ${error.message}`);
      }

      return data?.map((row) => row.id) || [];
    } catch (error) {
      console.error("Error getting applied migrations:", error);
      return [];
    }
  }

  private async runSingleMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Running migration: ${migration.name}`);

    try {
      // Execute the migration SQL
      const { error: sqlError } = await this.supabase.rpc("exec_sql", {
        sql: migration.up,
      });

      if (sqlError) {
        throw new Error(
          `Migration ${migration.id} failed: ${sqlError.message}`
        );
      }

      // Record that migration was applied
      const { error: recordError } = await this.supabase
        .from("schema_migrations")
        .insert({
          id: migration.id,
          name: migration.name,
        });

      if (recordError) {
        throw new Error(
          `Failed to record migration ${migration.id}: ${recordError.message}`
        );
      }

      console.log(`✅ Migration completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration ${migration.id} failed:`, error);
      throw error;
    }
  }

  async rollback(migrationId?: string): Promise<boolean> {
    try {
      const appliedMigrations = await this.getAppliedMigrations();

      if (appliedMigrations.length === 0) {
        console.log("No migrations to rollback");
        return true;
      }

      const targetMigration =
        migrationId || appliedMigrations[appliedMigrations.length - 1];
      const migration = migrations.find((m) => m.id === targetMigration);

      if (!migration) {
        throw new Error(`Migration ${targetMigration} not found`);
      }

      console.log(`🔄 Rolling back migration: ${migration.name}`);

      // Execute rollback SQL
      const { error: sqlError } = await this.supabase.rpc("exec_sql", {
        sql: migration.down,
      });

      if (sqlError) {
        throw new Error(`Rollback failed: ${sqlError.message}`);
      }

      // Remove from migrations table
      const { error: deleteError } = await this.supabase
        .from("schema_migrations")
        .delete()
        .eq("id", migration.id);

      if (deleteError) {
        throw new Error(
          `Failed to remove migration record: ${deleteError.message}`
        );
      }

      console.log(`✅ Rollback completed: ${migration.name}`);
      return true;
    } catch (error) {
      console.error("❌ Rollback failed:", error);
      return false;
    }
  }
}

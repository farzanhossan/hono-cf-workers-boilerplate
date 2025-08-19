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
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
    } catch (error) {
      throw new Error(`Failed to create migrations table: ${error}`);
    }
  }

  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const results = await this.db.query<{ id: string }>(
        "SELECT id FROM schema_migrations ORDER BY executed_at"
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
      // Execute migration SQL
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

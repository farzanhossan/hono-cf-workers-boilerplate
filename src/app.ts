import { Hono } from "hono";
import { corsMiddleware } from "@/shared/middleware/cors";
import { loggerMiddleware } from "@/shared/middleware/logger";
import { errorHandler } from "@/shared/middleware/error";
import { createUserRoutes } from "@/modules/users/routes/user.routes";
import { UserModule } from "@/modules/users/user.module";
import { Env } from "@/types";
import { DatabaseMigrator } from "@/database/migrator";

// Track migrations per environment
const migrationsRun = new Set<string>();

export function createApp(env: Env) {
  const app = new Hono();

  // Register modules
  UserModule.register(env);

  // Global middleware
  app.use("*", corsMiddleware);
  app.use("*", loggerMiddleware);

  // Run migrations automatically in development
  if (env.ENVIRONMENT === "development") {
    const envKey = `${env.SUPABASE_URL}-${env.ENVIRONMENT}`;

    app.use("*", async (c, next) => {
      // Only run migrations once per environment
      if (!migrationsRun.has(envKey)) {
        console.log("🔄 Running migrations...");

        try {
          const migrator = new DatabaseMigrator(env);
          const success = await migrator.runMigrations();

          if (!success) {
            console.error("❌ Migration failed");
            return c.json(
              {
                success: false,
                error: "Database migration failed. Check logs.",
              },
              500
            );
          }

          migrationsRun.add(envKey);
          console.log("✅ Migrations completed");
        } catch (error) {
          console.error("❌ Migration error:", error);
          return c.json(
            {
              success: false,
              error: "Database migration failed",
            },
            500
          );
        }
      }
      await next();
    });
  }

  // Health check
  app.get("/health", (c) => {
    return c.json({
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT,
    });
  });

  // API routes
  app.route("/api/v1/users", createUserRoutes());

  // Manual migration endpoint
  app.post("/migrate", async (c) => {
    try {
      console.log("🔄 Manual migration triggered");
      const migrator = new DatabaseMigrator(c.env);
      const success = await migrator.runMigrations();

      return c.json({
        success,
        message: success ? "Migrations completed" : "Migrations failed",
      });
    } catch (error) {
      console.error("Migration error:", error);
      return c.json(
        {
          success: false,
          error: "Migration failed",
        },
        500
      );
    }
  });

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        success: false,
        error: "Route not found",
      },
      404
    );
  });

  // Error handler
  app.onError(errorHandler);

  return app;
}

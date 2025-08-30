import { Hono } from "hono";
import { corsMiddleware } from "@/shared/middleware/cors";
import { loggerMiddleware } from "@/shared/middleware/logger";
import { errorHandler } from "@/shared/middleware/error";
import { UserModule } from "@/modules/users/user.module";
import { Env } from "@/types";
import { DatabaseMigrator } from "@/database/migrator";
import { PostModule } from "./modules/posts/post.module";
import { AuthModule } from "./modules/auth/auth.module";

export function createApp(env: Env) {
  const app = new Hono();

  // Register modules
  AuthModule.register(env);
  UserModule.register(env);
  PostModule.register(env);

  // Global middleware
  app.use("*", corsMiddleware);
  app.use("*", loggerMiddleware);

  // Remove the automatic migration code

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
  app.route("/api/v1/auth", AuthModule.getRoutes());
  app.route("/api/v1/users", UserModule.getRoutes());
  app.route("/api/v1/posts", PostModule.getRoutes());

  // Manual migration endpoint (keep this for manual triggers)
  app.get("/migrate", async (c) => {
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

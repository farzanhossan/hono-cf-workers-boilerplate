import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const token = authorization.substring(7);

  // Validate token here (JWT, API key, etc.)
  if (!token || token === "invalid") {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  // Add user info to context
  c.set("user", { id: "123", email: "user@example.com" });

  await next();
}

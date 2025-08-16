import { Context, Next } from "hono";

export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;

  await next();

  const end = Date.now();
  const status = c.res.status;
  const duration = end - start;

  console.log(`${method} ${url} ${status} ${duration}ms`);
}

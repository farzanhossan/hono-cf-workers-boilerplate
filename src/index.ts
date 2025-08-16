import { createApp } from "./app";
import { Env } from "@/types";
import { container } from "@/shared/container/container";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Clear container instances for each request to ensure fresh state
    container.clear();

    const app = createApp(env);
    return app.fetch(request, env, ctx);
  },
};

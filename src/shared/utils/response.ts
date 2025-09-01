import { Context } from "hono";
import { SuccessResponse } from "./success-response";
import { ResponseMeta } from "@/types";

export class ResponseHelper {
  // Success responses
  static success<T>(
    c: Context,
    data: T,
    message: string = "Success"
  ): Response {
    const requestId = c.get("requestId");
    const response = SuccessResponse.ok(message, data, requestId);
    return c.json(response.toJSON());
  }

  static created<T>(
    c: Context,
    data: T,
    message: string = "Created successfully"
  ): Response {
    const requestId = c.get("requestId");
    const response = SuccessResponse.created(message, data, requestId);
    return c.json(response.toJSON(), 201);
  }

  static paginated<T>(
    c: Context,
    data: T,
    meta: ResponseMeta,
    message: string = "Data retrieved successfully"
  ): Response {
    const requestId = c.get("requestId");
    const response = SuccessResponse.paginated(message, data, meta, requestId);
    return c.json(response.toJSON());
  }

  static empty(c: Context, message: string = "No content"): Response {
    const requestId = c.get("requestId");
    const response = SuccessResponse.ok(message, null, requestId);
    return c.json(response.toJSON());
  }
}

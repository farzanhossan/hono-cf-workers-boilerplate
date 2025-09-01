import { Context, Next } from "hono";
import { BadRequestException } from "../utils/exceptions";
import { SuccessResponse } from "../utils/success-response";

export class ResponseHandler {
  static middleware() {
    return async (c: Context, next: Next) => {
      await next();

      // Get the response
      const response = c.res;
      const requestId = c.get("requestId");

      // Only intercept successful responses (not errors)
      if (response.status >= 200 && response.status < 300) {
        try {
          const responseText = await response.text();
          let content: any;

          try {
            content = JSON.parse(responseText);
          } catch {
            // If not JSON, treat as string
            content = responseText;
          }

          // Transform the response
          const transformedResponse = ResponseHandler.transformResponse(
            content,
            requestId,
            c.req.path
          );

          // Replace the response
          c.res = new Response(JSON.stringify(transformedResponse), {
            status: transformedResponse.statusCode,
            headers: {
              "Content-Type": "application/json",
              ...Object.fromEntries(response.headers.entries()),
            },
          });
        } catch (error) {
          // If transformation fails, let the original response pass through
          console.error("Response transformation error:", error);
        }
      }
    };
  }

  private static transformResponse(
    content: any,
    requestId?: string,
    path?: string
  ) {
    // Handle null/undefined content
    if (!content) {
      return new SuccessResponse(
        "Successful empty response",
        null,
        200,
        undefined,
        requestId
      ).toJSON();
    }

    // If already a SuccessResponse instance, return as is
    if (content instanceof SuccessResponse) {
      // Handle special case where data is an array with count
      if (
        content.data &&
        Array.isArray(content.data) &&
        content.data.length === 2 &&
        typeof content.data[1] === "number"
      ) {
        const [data, total] = content.data;
        content.data = data;
        content.meta = { ...content.meta, total };
      }
      return content.toJSON();
    }

    // If already has success/statusCode properties, assume it's formatted
    else if (
      typeof content === "object" &&
      content.hasOwnProperty("success") &&
      content.hasOwnProperty("statusCode")
    ) {
      // Add missing properties if needed
      if (!content.timestamp) {
        content.timestamp = new Date().toISOString();
      }
      if (!content.requestId && requestId) {
        content.requestId = requestId;
      }
      if (!content.path && path) {
        content.path = path;
      }
      return content;
    }

    // If it's an object, wrap in SuccessResponse
    else if (typeof content === "object") {
      return new SuccessResponse(
        "Successful response",
        content,
        200,
        undefined,
        requestId
      ).toJSON();
    }

    // If it's a string, return as is (might be HTML, text, etc.)
    else if (typeof content === "string") {
      return content;
    }

    // For any other type, throw error
    else {
      throw new BadRequestException("Invalid response format");
    }
  }
}

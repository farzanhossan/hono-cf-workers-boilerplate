import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ApiResponse } from "@/types";

export async function errorHandler(err: Error, c: Context): Promise<Response> {
  console.error("Error:", err);

  if (err instanceof HTTPException) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
    };
    return c.json(response, err.status);
  }

  const response: ApiResponse = {
    success: false,
    error: "Internal Server Error",
  };
  return c.json(response, 500);
}

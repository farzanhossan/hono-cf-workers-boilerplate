import { Context } from "hono";
import { ApiResponse, PaginatedResponse } from "@/types";
import { CaseTransformer } from "./case-transformer";

export class ResponseHelper {
  static success<T>(c: Context, data: T, message?: string, status = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return c.json(CaseTransformer.snakeToCamel(response), status);
  }

  static error(c: Context, error: string, status = 400) {
    const response: ApiResponse = {
      success: false,
      error,
    };
    return c.json(response, status);
  }

  static paginated<T>(
    c: Context,
    data: T[],
    page: number,
    limit: number,
    total: number
  ) {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return c.json(CaseTransformer.snakeToCamel(response), 200);
  }
}

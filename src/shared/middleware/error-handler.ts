import { Context } from "hono";
import { LoggerService } from "../utils/logger";
import { HttpException, ForbiddenException } from "../utils/exceptions";
import { ErrorResponse } from "@/types";

export class ExceptionFilter {
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
    this.logger.setContext("ExceptionFilter");
  }

  catch(exception: any, c: Context): Response {
    const requestId = c.get("requestId");
    this.logger.error(exception, requestId);

    let statusCode: number;
    let errorMessages: string[] = [exception?.message || "Unknown error"];

    // Handle rate limiting
    if (
      exception.name === "TooManyRequestsException" ||
      exception.message?.includes("rate limit")
    ) {
      statusCode = 429;
      errorMessages = ["Too many requests. Please slow down."];
    }
    // Handle TypeError
    else if (exception instanceof TypeError) {
      statusCode = 500;
      errorMessages = exception.message
        ? [exception.message]
        : ["Internal Server Error"];
    }
    // Handle custom HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res: any = exception.getResponse();

      if (exception instanceof ForbiddenException) {
        errorMessages = ["Unauthorized request"];
      }
      // Database foreign key constraint
      else if (
        exception?.message?.includes("violates foreign key constraint")
      ) {
        const field = this.extractFieldFromError(
          exception.message,
          "Key (",
          ")"
        );
        errorMessages = [`${field || "Resource"} not found`];
        statusCode = 409;
      } else {
        errorMessages =
          typeof res.message === "string"
            ? [res.message]
            : res.message || [exception.message];
        if (exception?.cause) {
          errorMessages.push(exception.cause as any);
        }
      }
    }
    // Handle database errors
    else {
      if (
        exception?.message?.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        const field = this.extractFieldFromError(
          exception?.detail || exception.message,
          "Key (",
          ")"
        );
        errorMessages = [`${field || "Resource"} already exists`];
        statusCode = 409;
      } else if (exception?.message?.includes("null value in column")) {
        const field =
          exception.column ||
          this.extractFieldFromError(exception.message, 'column "', '"');
        errorMessages = [`${field || "Field"} is required`];
        statusCode = 400;
      } else if (exception?.statusCode) {
        statusCode = exception.statusCode;
      } else {
        statusCode = 500;
      }
    }

    const response: ErrorResponse = {
      success: false,
      statusCode,
      message: errorMessages[0] || "Something went wrong",
      errorMessages,
      timestamp: new Date().toISOString(),
      path: c.req.path,
      requestId,
    };

    return c.json(response, statusCode);
  }

  private extractFieldFromError(
    message: string,
    startDelimiter: string,
    endDelimiter: string
  ): string {
    try {
      const startIndex = message.indexOf(startDelimiter);
      if (startIndex === -1) return "";

      const fieldStart = startIndex + startDelimiter.length;
      const endIndex = message.indexOf(endDelimiter, fieldStart);

      return endIndex === -1 ? "" : message.substring(fieldStart, endIndex);
    } catch {
      return "";
    }
  }
}

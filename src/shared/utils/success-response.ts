import { ResponseMeta, SuccessResponseInterface } from "@/types";

export class SuccessResponse<T = any> {
  public success: boolean = true;
  public statusCode: number;
  public message: string;
  public data: T;
  public meta?: ResponseMeta;
  public timestamp: string;
  public requestId?: string;

  constructor(
    message: string,
    data?: T,
    statusCode: number = 200,
    meta?: ResponseMeta,
    requestId?: string
  ) {
    this.statusCode = statusCode;
    this.message = message || "Success";
    this.data = data || null;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;

    if (meta) {
      this.meta = meta;
    }
  }

  // Static factory methods for common responses
  static ok<T>(
    message: string,
    data?: T,
    requestId?: string
  ): SuccessResponse<T> {
    return new SuccessResponse(message, data, 200, undefined, requestId);
  }

  static created<T>(
    message: string,
    data?: T,
    requestId?: string
  ): SuccessResponse<T> {
    return new SuccessResponse(message, data, 201, undefined, requestId);
  }

  static paginated<T>(
    message: string,
    data: T,
    meta: ResponseMeta,
    requestId?: string
  ): SuccessResponse<T> {
    return new SuccessResponse(message, data, 200, meta, requestId);
  }

  // Convert to JSON response
  toJSON(): SuccessResponseInterface<T> {
    const response: SuccessResponseInterface<T> = {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };

    if (this.meta) {
      response.meta = this.meta;
    }

    return response;
  }
}

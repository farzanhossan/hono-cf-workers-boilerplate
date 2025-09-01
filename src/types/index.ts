export interface Env {
  CACHE?: KVNamespace;
  ENVIRONMENT: string;
  DATABASE_TYPE?: string; // Add this
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  HYPERDRIVE?: Hyperdrive;
}

export interface Context {
  env: Env;
  executionCtx: ExecutionContext;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ERROR_EXCEPTIONS: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// export interface ErrorResponse {
//   success: false;
//   statusCode: number;
//   message: string;
//   errorMessages: string[];
//   timestamp: string;
//   path: string;
//   requestId?: string;
// }

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ResponseMeta {
  total?: number;
  limit?: number;
  page?: number;
  skip?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface BaseResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  errorMessages: string[];
}

export interface SuccessResponseInterface<T = any> extends BaseResponse {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

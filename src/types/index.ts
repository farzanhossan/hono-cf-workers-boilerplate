export interface Env {
  CACHE?: KVNamespace;
  ENVIRONMENT: string;
  DATABASE_TYPE?: string; // Add this
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export interface Context {
  env: Env;
  executionCtx: ExecutionContext;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

export interface CreateResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  success: true;
  data: T[];
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
} as const;

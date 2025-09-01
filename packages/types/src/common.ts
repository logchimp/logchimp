export type ApiSortType = "DESC" | "ASC";

export interface IApiStatus {
  code: number;
  type: "success" | "error";
}

export interface ApiPaginationType {
  page: number;
  limit?: string;
  sort?: ApiSortType;
}

export interface CursorPaginationParams {
  first?: number;
  after?: string;
}

export interface PageInfo {
  count: number;
  current_page: number;
  has_next_page: boolean;
  end_cursor: string | null;
  start_cursor: string | null;
}

export interface CursorPaginatedResponse<T> {
  results: T[];
  page_info: PageInfo;
  total_pages?: number | null;
  total_count?: number | null;
}

export interface IApiErrorResponse {
  message: string;
  code: string;
  // TODO: add TS type
  errors?: unknown;
}

export interface IApiValidationErrorResponse {
  errors: IApiErrorResponse[];
}

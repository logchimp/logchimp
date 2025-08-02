/**
 * Generic pagination information for API responses
 */
export interface PaginationInfo {
  count: number;
  current_page: number;
  has_next_page: boolean;
}

/**
 * Generic paginated response structure
 * @template T - The type of data being paginated
 */
export interface PaginatedResponse<T> {
  data: T[];
  page_info: PaginationInfo;
  total_pages?: number | null;
  total_count?: number | null;
}

/**
 * Pagination query parameters for cursor-based pagination
 */
export interface PaginationParams {
  first?: number;
  after?: string;
}

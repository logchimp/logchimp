export type ApiSortType = "DESC" | "ASC";

export interface ApiPaginationType {
  page: number;
  limit?: number;
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
  endCursor: string | null;
  startCursor: string | null;
}

export interface CursorPaginatedResponse<T> {
  results: T[];
  page_info: PageInfo;
  total_pages?: number | null;
  total_count?: number | null;
}

export interface DraggableSortFromToType {
  from: {
    id: string;
    index: string;
  };
  to: {
    id: string;
    index: string;
  };
}

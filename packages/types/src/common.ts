export type ApiSortType = "DESC" | "ASC";

export interface ApiPaginationType {
  page: number;
  limit?: number;
  sort?: ApiSortType;
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

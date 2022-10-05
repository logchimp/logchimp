export type ApiSortType = "DESC" | "ASC"

export interface ApiPaginationType {
	page: number
	limit?: number
	sort?: ApiSortType
}


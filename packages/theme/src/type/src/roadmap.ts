import type { PaginatedResponse } from './common';

export interface Roadmap {
  id: string;
  name: string;
  url: string;
  color: string;
  display: string;
  index: number;
}

/**
 * Paginated response for roadmaps
 * Extends the generic PaginatedResponse with Roadmap data
 */
export interface PaginatedRoadmapsResponse extends PaginatedResponse<Roadmap> {
  // Additional roadmap-specific fields can be added here if needed
}

/**
 * Parameters for getting roadmaps with pagination
 */
export interface GetRoadmapsParams {
  first?: number;
  after?: string;
}

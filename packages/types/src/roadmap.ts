import type {
  CursorPaginationParams,
  CursorPaginatedResponse
} from "./common";

export interface IRoadmap {
  id: string;
  name: string;
  url: string;
  color: string;
}

export interface IRoadmapPrivate extends IRoadmap {
  index: number;
  display: boolean;
}

export type GetRoadmapsParams = CursorPaginationParams;

export interface PaginatedRoadmapsResponse
  extends CursorPaginatedResponse<IRoadmapPrivate> {
  roadmaps: IRoadmapPrivate[];
}

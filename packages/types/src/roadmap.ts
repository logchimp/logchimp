import type { CursorPaginationParams, CursorPaginatedResponse } from "./common";

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

export type TGetRoadmapsParams = CursorPaginationParams;

export interface IPaginatedRoadmapsResponse
  extends CursorPaginatedResponse<IRoadmapPrivate> {
  roadmaps: IRoadmapPrivate[];
}

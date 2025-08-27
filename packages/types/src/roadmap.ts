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
  created_at: Date;
}

export type TGetRoadmapsParams = CursorPaginationParams;

export interface IPaginatedRoadmapsResponse
  extends CursorPaginatedResponse<IRoadmapPrivate> {
  roadmaps: IRoadmapPrivate[];
}

export interface IGetRoadmapByUrlRequestParam {
  url: string;
}

export interface IGetRoadmapByUrlResponseBody {
  roadmap: IRoadmapPrivate;
}

export interface ISearchRoadmapRequestParam {
  name: string;
}

export interface ISearchRoadmapResponseBody {
  roadmaps: IRoadmapPrivate[];
}

export interface IUpdateRoadmapRequestBody {
  name: string;
  url: string;
  color: string;
  display: boolean;
}

export type TUpdateRoadmapResponseBody = IGetRoadmapByUrlResponseBody;

export interface IDeleteRoadmapRequestBody {
  id: string;
}

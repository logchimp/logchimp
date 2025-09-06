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

export interface ICreateRoadmapRequestBody {
  name?: string;
}

export type TCreateRoadmapResponseBody = IGetRoadmapByUrlResponseBody;

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

export type TDeleteRoadmapResponseBody = string;

export interface ISortRoadmapRequestBody {
  from: {
    id: string;
    index: number;
  };
  to: {
    id: string;
    index: number;
  };
}

export type TSortRoadmapResponseBody = "OK";

import type { ApiSortType } from "./common";

export interface IBoard {
  boardId: string;
  name: string;
  url: string;
  color: string;
  display: boolean;
  view_voters: boolean;
  post_count: string;
  createdAt: Date;
}

export interface IGetBoardsRequestQuery {
  page: string;
  limit?: number;
  created: ApiSortType;
}

export interface IGetBoardsResponseBody {
  boards: IBoard[];
}

export type TFilterBoardRequestQuery = IGetBoardsRequestQuery;

export interface IFilterBoardResponseBody {
  boards: Pick<IBoard, "boardId" | "name" | "color" | "url">[];
}

export type TBoardCheckNameBody = {
  name: string;
};

export type TBoardCheckNameResponse = {
  readonly available: boolean;
};

export type TBoardCreateRequestBody = {
  name?: string;
  display?: boolean;
};

export type TBoardCreateResponseBody = {
  board: IBoard;
};

export type TBoardUpdateBody = {
  name: string;
  url: string;
  color: string;
  view_voters: boolean;
  display: boolean;
};

export type TBoardDeleteBody = {
  boardId: string;
};

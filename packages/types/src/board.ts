import type { ApiSortType } from "./common";

export interface IBoard {
  boardId: string;
  name: string;
  url: string;
  color: string;
  post_count: string | undefined;
  createdAt: Date;
}

export interface IBoardPrivate extends IBoard {
  display: boolean;
  // view_voters: boolean;
}

export interface IGetBoardsRequestQuery {
  page: string;
  limit?: number;
  created: ApiSortType;
}

export interface IGetBoardsResponseBody {
  boards: IBoardPrivate[];
}

export type TFilterBoardRequestQuery = IGetBoardsRequestQuery;

export interface IFilterBoardResponseBody {
  boards: IBoard[];
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

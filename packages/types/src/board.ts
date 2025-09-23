import type { ApiSortType } from "./common";

export interface IBoard {
  boardId: string;
  name: string;
  url: string;
  color: string;
  createdAt: Date;
}

export interface IBoardDetail extends IBoard {
  post_count: string;
}

export interface IBoardPrivate extends IBoardDetail {
  display: boolean;
  view_voters: boolean;
}

export interface IGetBoardsRequestQuery {
  page: string;
  limit?: string;
  created: ApiSortType;
}

export interface IGetBoardsResponseBody {
  boards: IBoardPrivate[];
}

export type TFilterBoardRequestQuery = IGetBoardsRequestQuery;

export interface IFilterBoardResponseBody {
  boards: IBoardDetail[];
}

export interface IGetBoardByUrlRequestParams {
  url: string;
}

export interface IGetBoardsByUrlResponseBody {
  board: IBoardPrivate;
}

export type TBoardCheckSlugBody = {
  url: string;
};

export type TBoardCheckSlugResponse = {
  readonly available: boolean;
};

export type TBoardCheckNameBody = {
  // DEPRECATED, will be removed
  name: string;
};

export type TBoardCheckNameResponse = {
  // DEPRECATED, will be removed
  readonly available: boolean;
};

export type TBoardCreateRequestBody = {
  name?: string;
  display?: boolean;
};

export type TBoardCreateResponseBody = IGetBoardsByUrlResponseBody;

export interface IBoardUpdateRequestBody {
  boardId: string;
  name: string;
  url: string;
  color: string;
  view_voters: boolean;
  display: boolean;
}

export type TBoardUpdateResponseBody = IGetBoardsByUrlResponseBody;

export interface IBoardDeleteRequestBody {
  boardId: string;
}

export interface ISearchBoardRequestParams {
  name: string;
}

export interface ISearchBoardResponseBody {
  boards: IBoardPrivate[];
}

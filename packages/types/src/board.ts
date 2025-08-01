export interface IBoard {
  boardId: string;
  name: string;
  url: string;
  color: string;
  display: boolean;
  view_voters: boolean;
  createdAt: Date;
}

export type TBoardCheckNameBody = {
  name: string;
};

export type TBoardCheckNameResponse = {
  readonly available: boolean;
};

export type TBoardCreateBody = {
  name: string;
  display: boolean;
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

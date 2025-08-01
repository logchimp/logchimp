export interface IBoard {
  boardId: string;
  name: string;
  url: string;
  color: string;
  createdAt: Date;
  post_count: string;
}

export interface IBoardPrivate extends IBoard {
  display: boolean;
}

export type TBoardCheckNameBody = {
  name: string;
};

export type TBoardCheckNameResponse = {
  readonly available: boolean;
};

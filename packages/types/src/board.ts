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

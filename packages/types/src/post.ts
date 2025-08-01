import type { ICurrentUserVote, IUserVoter } from "./vote";

export interface IPost extends IPostInfo {
  board: {
    boardId: "61ae9848-8efa-4078-82b1-f923092f223e";
    name: "new board";
    url: "new-board-vgzylvf3cv";
    color: "537509";
  };
  author: {
    userId: "7aa15af0-1ede-46d2-9995-3738d3589cfc";
    name: "admin";
    username: "admin";
    avatar: "https://www.gravatar.com/avatar/fc51027a642571734eaaefd103b2f00c";
  };
  roadmap: {
    id: "9dacf604-e769-4e0d-bac8-ae49a21abbed";
    name: "new roadmap";
    url: "new-roadmap-pe2imoipp4";
    color: "cde55b";
  };
  updatedAt: "2025-07-31T18:35:20.747Z";
  voters: {
    votes: Array<IUserVoter>;
    votesCount: number;
    viewerVote: ICurrentUserVote;
  };
}

export interface IPostItem extends IPostInfo {
  board: IPostBoard;
  voters: {
    votes: Array<IUserVoter>;
    votesCount: number;
    viewerVote: ICurrentUserVote;
  };
}

interface IPostInfo {
  postId: string;
  title: string;
  slug: string;
  contentMarkdown?: string;
  createdAt: Date;
}

// TODO: needs to be replaced with IBoard
interface IPostBoard {
  boardId: string;
  name: string;
  url: string;
  color: string;
  display: boolean;
  // TODO: this property needs to be removed from APIs
  view_voters: boolean;
  createdAt: Date;
  updatedAt: Date;
}

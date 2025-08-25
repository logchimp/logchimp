import type { IPublicUserInfo } from "./user";
import type { IPostVote } from "./vote";
import type { IRoadmap } from "./roadmap";
import type { IBoard } from "./board";
import type { ApiSortType } from "./common";

export interface IPost extends IPostInfo {
  board: IBoard;
  author: IPublicUserInfo;
  updatedAt: Date;
  voters: IPostVote;
}

export interface IPostItem extends IPostInfo {
  board: IPostBoard;
  roadmap?: IRoadmap;
  voters: IPostVote;
}

interface IPostInfo {
  postId: string;
  title: string;
  slug: string;
  // slugId
  // updatedAt
  contentMarkdown: string | null;
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

export interface IFilterPostRequestBody {
  userId: string;
  boardId: string[];
  roadmapId: string;
  page: string;
  limit?: number;
  created: ApiSortType;
}

export interface IFilterPostResponseBody {
  posts: IPost[];
}

export interface IGetPostBySlugResponseBody {
  post: IPost;
}

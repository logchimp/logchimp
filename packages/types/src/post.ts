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

export interface IGetPostBySlugRequestBody {
  slug: string;
  userId: string;
}

export interface IGetPostBySlugResponseBody {
  post: IPost;
}

export interface ICreatePostRequestBody {
  title: string;
  contentMarkdown: string;
  boardId: string;
  roadmapId?: string;
}

export interface ICreatePostResponseBody {
  post: {
    postId: string;
    title: string;
    slug: string;
    slugId: string;
    contentMarkdown: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    boardId: string;
    roadmap_id: string;
  };
}

export interface IUpdatePostRequestBody {
  id: string;
  title: string;
  contentMarkdown: string;
  slugId: string;
  userId: string;
  boardId?: string;
  roadmapId?: string;
}

export type TUpdatePostResponseBody = ICreatePostResponseBody;

export interface IDeletePostByIdRequestBody {
  id: string;
}

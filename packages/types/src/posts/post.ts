import type { IPublicUserInfo } from "../user";
import type { IPostVote } from "../vote";
import type { IRoadmap } from "../roadmap";
import type { IBoard } from "../board";
import type { ApiSortType, CursorPaginatedResponse } from "../common";

export interface IPost extends IPostInfo {
  board: IBoard | null;
  author: IPublicUserInfo;
  roadmap: IRoadmap | null;
  voters: IPostVote;
}

export interface IDashboardPost extends IPost {
  slugId: string;
}

interface IPostInfo {
  postId: string;
  title: string;
  slug: string;
  updatedAt: Date;
  contentMarkdown: string | null;
  createdAt: Date;
}

export interface IFilterPostRequestBody {
  boardId: string[];
  roadmapId?: string;
  page: string;
  limit?: string;
  created: ApiSortType;
}

export interface IFilterPostResponseBody {
  posts: IPost[];
}

export interface IGetPostBySlugRequestBody {
  slug: string;
}

export interface IGetPostBySlugResponseBody {
  post: IDashboardPost;
}

export interface ICreatePostRequestBody {
  title?: string;
  contentMarkdown?: string | null;
  boardId?: string;
  roadmapId?: string;
}

export interface ICreatePostResponseBody {
  post: {
    postId: string;
    title: string;
    slug: string;
    slugId: string;
    contentMarkdown: string | null;
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
  contentMarkdown: string | null;
  slugId: string;
  userId: string;
  boardId?: string | null;
  roadmapId?: string | null;
}

export type TUpdatePostResponseBody = ICreatePostResponseBody;

export interface IDeletePostByIdRequestBody {
  id: string;
}

export interface IUserVoteV2 {
  voteId: string;
  user: IPublicUserInfo;
}

export interface IPostVotes<T> extends CursorPaginatedResponse<T> {
  viewerVote?: IUserVoteV2;
}

export interface IGetPostVotesRequestParams {
  post_id: string;
}

export interface IPaginatedPostVotesResponse {
  votes: IPostVotes<IUserVoteV2>;
}

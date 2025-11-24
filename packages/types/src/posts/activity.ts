import type { IPublicUserInfo } from "../user";

export type TPostActivityType = "comment";

export interface IPostActivity {
  id: string;
  created_at: Date;
  type: TPostActivityType;
  author: IPublicUserInfo;
  comment: IComment;
}

export interface IComment {
  id: string;
  body: string;
  is_edited: boolean;
  is_internal: boolean;
  is_spam: boolean;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IGetPostActivityRequestParam {
  post_id: string;
}

export interface IGetPostActivityRequestQuery {
  page: string;
  limit?: string;
}

export interface IGetPostActivityResponseBody {
  activity: IPostActivity[];
}

export type TCreatePostCommentRequestParam = IGetPostActivityRequestParam;

export interface ICreatePostCommentRequestBody {
  body: string;
  is_internal: boolean;
  parent_id?: string;
}

export interface ICreatePostCommentResponseBody {
  activity: IPostActivity;
}

export interface IUpdatePostCommentRequestParam {
  post_id: string;
  comment_id: string;
}

export interface IUpdatePostCommentRequestBody {
  body: string;
  is_internal: boolean;
  is_spam: boolean;
}

export interface IUpdatePostCommentResponseBody {
  comment: IComment;
}

export type TDeletePostCommentRequestParam = IUpdatePostCommentRequestParam;

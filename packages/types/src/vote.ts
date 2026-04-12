import type { IUserVoteV2 } from "./posts";

export interface IUserVoter extends ICurrentUserVote {
  name: string | null;
  username: string;
  avatar: string | null;
}

export interface ICurrentUserVote {
  voteId: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface IPostVote {
  votes: IUserVoter[];
  votesCount: number;
  viewerVote?: ICurrentUserVote;
}

export interface IAddVoteRequestParams {
  post_id: string;
  user_id?: string;
}

export interface IAddVoteRequestBody {
  postId: string;
}

export interface IAddVoteResponseBody {
  voters: IPostVote;
}

export interface IAddVoteV2ResponseBody {
  vote: IUserVoteV2;
}

export type TRemoveVoteRequestParams = IAddVoteRequestParams;

export interface IRemoveVoteRequestBody {
  postId: string;
}

export type TRemoveVoteResponseBody = IAddVoteResponseBody;

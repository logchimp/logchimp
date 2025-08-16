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
  viewerVote: ICurrentUserVote;
}

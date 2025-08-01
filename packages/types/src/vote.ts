export interface IUserVoter extends ICurrentUserVote {
  name: string;
  username: string;
  avatar: string;
}

export interface ICurrentUserVote {
  voteId: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

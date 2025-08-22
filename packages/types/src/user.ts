export interface IUserInfo {
  userId: string;
  name: string | null;
  username: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  isBlocked: boolean;
  isOwner: boolean;
  notes: string | null;
  createdAt: Date;
}

export interface IGetUserInfoRequestParams {
  user_id: string;
}

export type TGetUserInfoResponseBody = {
  user: IUserInfo;
};

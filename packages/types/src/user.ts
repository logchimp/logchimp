export interface IUser {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  username?: string;
  isVerified: boolean;
  // vote count
  votes: string;
  // post count
  posts: string;
  roles: IUserRole[];
}

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

export interface IGetAllUsers {
  users: IUser[];
}

export interface IUserRole {
  id: string;
  name: string;
  user_role_id: string;
}

export interface IGetUserInfoRequestParams {
  user_id: string;
}

export type TGetUserInfoResponseBody = {
  user: IUserInfo;
};

export type TUserAssignRoleResponse =
  // UserAssignRoleResponseSuccess
  | ({
      success: 1;
    } & IUserRole)
  // UserAssignRoleResponseError
  | {
      success: 0;
    };

import {
  ApiSortType,
  CursorPaginatedResponse,
  CursorPaginationParams,
  IApiStatus,
} from "./common";

export interface IPublicUserInfo {
  userId: string;
  name: string | null;
  avatar: string | null;
  username: string;
}

export interface IUser {
  userId: string;
  name: string | null;
  email: string;
  avatar: string | null;
  username: string;
  isVerified: boolean;
  // vote count
  votes: string;
  // post count
  posts: string;
  roles: IUserRole[];
}

export interface IUserInfo extends IPublicUserInfo {
  email: string;
  isVerified: boolean;
  isBlocked: boolean;
  isOwner: boolean;
  notes: string | null;
  createdAt: Date;
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

export interface IGetUsersRequestQuery extends CursorPaginationParams {
  created: ApiSortType;
  /**
   * For backward compatibility to support offset pagination,
   * will be removed in the next major release.
   */
  page?: string;
  limit?: string;
}

export interface IGetUsersResponseBody
  extends Partial<CursorPaginatedResponse<IUser>> {
  status: IApiStatus;
  users: IUser[];
}

export type TUserAssignRoleResponse =
  // UserAssignRoleResponseSuccess
  | ({
      success: 1;
    } & IUserRole)
  // UserAssignRoleResponseError
  | {
      success: 0;
    };

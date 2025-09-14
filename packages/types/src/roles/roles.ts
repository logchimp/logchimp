import type { TPermission } from "./permissions";
import type { IUserRole } from "../user";

export interface IRole {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IGetAllRoles {
  roles: IRole[];
}

export interface IGetRoleByIdRequestParams {
  role_id: string;
}

export interface IGetRoleByIdResponseBody {
  role: IRole & {
    permissions: TPermission[];
  };
}

export interface IUpdateRoleRequestBody {
  id: string;
  name: string;
  description: string | null;
  permissions?: TPermission[];
}

export interface IUpdateRoleResponseBody {
  role: IRole;
  permissions: TPermission[];
}

export interface ICreateRoleResponseBody {
  role: IRole;
}

export interface IAssignRoleToUserRequestParams {
  role_id: string;
  user_id: string;
}

export type TAssignRoleToUserResponseBody =
  // AssignRoleToUserResponseBodySuccess
  | ({
      success: 1;
    } & IUserRole)
  // AssignRoleToUserResponseBodyError
  | {
      success: 0;
    };

export type TUnassignRoleToUserRequestParams = IAssignRoleToUserRequestParams;

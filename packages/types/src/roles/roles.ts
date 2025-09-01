import type { TPermission } from "./permissions";

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
  id: string;
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
  permissions: TPermission[];
}

export interface IUpdateRoleResponseBody {
  role: IRole;
  permissions: TPermission[];
}

export interface ICreateRoleResponseBody {
  role: IRole;
}

import type { TPermission } from "@logchimp/types";

export interface IAuthenticationTokenPayload {
  userId: string;
  email: string;
}

export interface IGetUserInfoWithRoles {
  userId: string;
  name: string | null;
  username: string;
  email: string;
  isOwner: boolean;
  isBlocked: boolean;
  roles: string[];
}

export interface IAuthenticationMiddlewareUser extends IGetUserInfoWithRoles {
  permissions: TPermission[];
}

export interface IPasswordResetJwtPayload {
  userId: string;
  email: string;
  type: "resetPassword";
}

export interface IVerifyEmailJwtPayload {
  userId: string;
  email: string;
  type: "emailVerification";
}

import type { components } from "@logchimp/api-ts-types";

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

export interface IAuthenticationMiddlewareUser
  extends Omit<IGetUserInfoWithRoles, "roles"> {
  permissions: components["schemas"]["Permission"][];
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

export type TLicenseSubscriptionType =
  | "free"
  | "pro"
  | "business"
  | "enterprise";

export interface LicenseGuardOptions {
  requiredPlan: Array<TLicenseSubscriptionType>;
  skipHandlerOnFailure: boolean;
}

export type TEmailVerification = {
  email: string;
  token: string;
  createdAt: Date;
};

export type TResetPassword = TEmailVerification;

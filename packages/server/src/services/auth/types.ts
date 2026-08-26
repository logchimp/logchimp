import type { IAuthUser } from "@logchimp/types";

export type TCreatedUser = Omit<IAuthUser, "authToken">;

export type CreateUserOptions = {
  user?: {
    password?: string;
    name?: string;
    tenantUserId?: string;
  };
  options?: {
    sendAccountVerificationEmail?: boolean;
  };
};

export type SsoLogChimpIdentityPayload = {
  name?: string | null;
  email: string;
  avatar?: string;
};

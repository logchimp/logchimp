import type { IAuthUser } from "@logchimp/types";

export type TCreatedUser = Omit<IAuthUser, "authToken">;

export type CreateUserOptions = {
  user?: {
    password?: string;
    name?: string;
  };
  options?: {
    sendAccountVerificationEmail?: boolean;
  };
};

export type SsoLogChimpIdentityPayload = {
  email: string;
  avatar?: string;
};

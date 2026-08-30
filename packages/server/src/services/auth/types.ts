import type { IAuthUser } from "@logchimp/types";

export type TCreatedUser = Omit<IAuthUser, "authToken">;

export type CreateUserOptions = {
  user?: {
    password?: string;
    name?: string;
    avatar?: string;
  };
  options?: {
    sendAccountVerificationEmail?: boolean;
  };
};

export type GetOrCreateOpenIDConnectUserOptions = {
  issuer: string;
  subject: string;
  name?: string;
  email: string;
  emailVerified?: boolean;
  picture?: string;
};

import type { IAuthUser } from "@logchimp/types";

export type TCreatedUser = Omit<IAuthUser, "authToken">;

export type CreateUserOptions = {
  password?: string;
  name?: string;
};

export interface IAuthUser {
  userId: string;
  avatar: string;
  email: string;
  name: string;
  username: string;
  authToken: string;
}

export interface IAuthUserProfileResponse<T> {
  user: T;
}

export interface IAuthUserProfile {
  userId: string;
  name: string;
  username: string;
  email: string;
  isVerified: boolean;
}

export interface IUpdateUserSettingsArgs {
  name?: string;
}

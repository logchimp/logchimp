export interface IAuthUser {
  userId: string;
  avatar: string | null;
  email: string;
  name: string | null;
  username: string;
  authToken: string;
}

export type TEmailVerification = {
  email: string;
  token: string;
  createdAt: Date;
};

export type TResetPassword = TEmailVerification;

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

export interface IAuthEmailVerifyResponseBody {
  verify: {
    success: boolean;
    __token?: TEmailVerification;
  };
}

export interface IAuthPasswordResetResponseBody {
  reset: {
    success: boolean;
    __token?: TResetPassword;
  };
}

export interface IAuthLoginRequestBody {
  email: string;
  password: string;
}

export interface IAuthLoginResponseBody {
  user: IAuthUser;
}

export type TAuthSignupRequestBody = IAuthLoginRequestBody;

export type IAuthSignupResponseBody = IAuthLoginResponseBody;

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

export interface IPasswordResetValidationTokenResponseBody {
  reset: {
    valid: boolean;
    __token?: TResetPassword;
  };
}

export interface ISetPasswordRequestBody {
  token: string;
  password: string;
}

export interface ISetPasswordResponseBody {
  reset: {
    success: boolean;
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

export interface ICreateSiteSetupRequestBody {
  siteTitle: string;
  name: string;
  email: string;
  password: string;
}
export type TCreateSiteSetupResponseBody = IAuthLoginResponseBody;

export interface IValidateEmailVerificationTokenRequestBody {
  token: string;
}

export interface IValidateEmailVerificationTokenResponseBody {
  verify: {
    success: boolean;
  };
}

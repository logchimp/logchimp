import type {
  IAuthLoginRequestBody,
  IAuthLoginResponseBody,
  IAuthMeResponseBody,
  IAuthPasswordResetResponseBody,
  IAuthSignupResponseBody,
  IPasswordResetValidationTokenResponseBody,
  ISetPasswordRequestBody,
  ISetPasswordResponseBody,
  IValidateEmailVerificationTokenResponseBody,
  TAuthSignupRequestBody,
} from "@logchimp/types";
import { VITE_API_URL } from "../constants";
import { APIService } from "./api.ts";

export class AuthAPI extends APIService {
  constructor(baseURL?: string) {
    super(baseURL || `${VITE_API_URL}/api`);
  }

  /**
   * Sign in to user account
   * @param {object} arg0
   * @param {string} arg0.email user email address
   * @param {string} arg0.password user password
   * @returns {Promise<IAuthLoginResponseBody>} response
   */
  Signin = async ({
    email,
    password,
  }: IAuthLoginRequestBody): Promise<IAuthLoginResponseBody> => {
    return this.post("/v1/auth/login", {
      email,
      password,
    })
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Create user account
   * @param {object} arg0
   * @param {string} arg0.email user email address
   * @param {string} arg0.password user password
   * @returns {Promise<IAuthSignupResponseBody>} response
   */
  Signup = async ({
    email,
    password,
  }: TAuthSignupRequestBody): Promise<IAuthSignupResponseBody> => {
    return this.post("/v1/auth/signup", {
      email,
      password,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Validate user email address
   * @param {string} token email address verification token
   * @returns {Promise<IValidateEmailVerificationTokenResponseBody>} response
   */
  VerifyUserEmail = async (
    token: string,
  ): Promise<IValidateEmailVerificationTokenResponseBody> => {
    return this.post("/v1/auth/email/validate", {
      token,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Request for password reset
   * @param {string} email user email address
   * @returns {Promise<IAuthPasswordResetResponseBody>} response
   */
  RequestPasswordReset = async (
    email: string,
  ): Promise<IAuthPasswordResetResponseBody> => {
    return this.post("/v1/auth/password/reset", {
      email,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Validate reset password token
   * @param {string} token reset password token
   * @returns {Promise<IPasswordResetValidationTokenResponseBody>} response
   */
  ValidateResetPasswordToken = async (
    token: string,
  ): Promise<IPasswordResetValidationTokenResponseBody> => {
    return this.post("/v1/auth/password/validateToken", {
      token,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Set new password
   * @param {object} arg0
   * @param {string} arg0.token reset password token
   * @param {string} arg0.password new password
   * @returns {Promise<ISetPasswordResponseBody>} response
   */
  SetNewPassword = async ({
    token,
    password,
  }: ISetPasswordRequestBody): Promise<ISetPasswordResponseBody> => {
    return this.post("/v1/auth/password/set", {
      token,
      password,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  getMe = async (): Promise<IAuthMeResponseBody> => {
    return this.get("/v1/auth/me")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

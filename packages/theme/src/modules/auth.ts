import axios, { type AxiosResponse } from "axios";
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
   * @returns {Promise<AxiosResponse<IAuthLoginResponseBody>>} response
   */
  Signin = async ({
    email,
    password,
  }: IAuthLoginRequestBody): Promise<AxiosResponse<IAuthLoginResponseBody>> => {
    return this.post("/v1/auth/login", {
      email,
      password,
    });
  };

  /**
   * Create user account
   * @param {object} arg0
   * @param {string} arg0.email user email address
   * @param {string} arg0.password user password
   * @returns {Promise<AxiosResponse<IAuthSignupResponseBody>>} response
   */
  Signup = async ({
    email,
    password,
  }: TAuthSignupRequestBody): Promise<
    AxiosResponse<IAuthSignupResponseBody>
  > => {
    return this.post("/v1/auth/signup", {
      email,
      password,
    });
  };

  /**
   * Validate user email address
   * @param {string} token email address verification token
   * @returns {Promise<AxiosResponse<IValidateEmailVerificationTokenResponseBody>>} response
   */
  VerifyUserEmail = async (
    token: string,
  ): Promise<AxiosResponse<IValidateEmailVerificationTokenResponseBody>> => {
    return this.post("/v1/auth/email/validate", {
      token,
    });
  };

  /**
   * Request for password reset
   * @param {string} email user email address
   * @returns {Promise<AxiosResponse<IAuthPasswordResetResponseBody>>} response
   */
  RequestPasswordReset = async (
    email: string,
  ): Promise<AxiosResponse<IAuthPasswordResetResponseBody>> => {
    return this.post("/v1/auth/password/reset", {
      email,
    });
  };

  /**
   * Validate reset password token
   * @param {string} token reset password token
   * @returns {Promise<AxiosResponse<IPasswordResetValidationTokenResponseBody>>} response
   */
  ValidateResetPasswordToken = async (
    token: string,
  ): Promise<AxiosResponse<IPasswordResetValidationTokenResponseBody>> => {
    return await axios({
      method: "POST",
      url: `${VITE_API_URL}/api/v1/auth/password/validateToken`,
      data: {
        token,
      },
    });
  };

  /**
   * Set new password
   * @param {object} arg0
   * @param {string} arg0.token reset password token
   * @param {string} arg0.password new password
   * @returns {Promise<AxiosResponse<ISetPasswordResponseBody>>} response
   */
  SetNewPassword = async ({
    token,
    password,
  }: ISetPasswordRequestBody): Promise<
    AxiosResponse<ISetPasswordResponseBody>
  > => {
    return await axios({
      method: "POST",
      url: `${VITE_API_URL}/api/v1/auth/password/set`,
      data: {
        token,
        password,
      },
    });
  };

  getMe = async (): Promise<IAuthMeResponseBody> => {
    const url = "/v1/auth/me";

    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

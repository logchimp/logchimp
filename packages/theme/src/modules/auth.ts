import axios, { type AxiosResponse } from "axios";
import type {
  IAuthLoginRequestBody,
  IAuthLoginResponseBody,
  IAuthPasswordResetResponseBody,
  IAuthSignupResponseBody,
  IPasswordResetValidationTokenResponseBody,
  ISetPasswordRequestBody,
  ISetPasswordResponseBody,
  IValidateEmailVerificationTokenResponseBody,
  TAuthSignupRequestBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../constants";

/**
 * Sign in to user account
 * @param {object} arg0
 * @param {string} arg0.email user email address
 * @param {string} arg0.password user password
 * @returns {Promise<AxiosResponse<IAuthLoginResponseBody>>} response
 */
export const signin = async ({
  email,
  password,
}: IAuthLoginRequestBody): Promise<AxiosResponse<IAuthLoginResponseBody>> => {
  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/login`,
    data: {
      email,
      password,
    },
  });
};

/**
 * Create user account
 * @param {object} arg0
 * @param {string} arg0.email user email address
 * @param {string} arg0.password user password
 * @returns {Promise<AxiosResponse<IAuthSignupResponseBody>>} response
 */
export const signup = async ({
  email,
  password,
}: TAuthSignupRequestBody): Promise<AxiosResponse<IAuthSignupResponseBody>> => {
  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/signup`,
    data: {
      email,
      password,
    },
  });
};

/**
 * Validate user email address
 * @param {string} token email address verification token
 * @returns {Promise<AxiosResponse<IValidateEmailVerificationTokenResponseBody>>} response
 */
export const verifyUserEmail = async (
  token: string,
): Promise<AxiosResponse<IValidateEmailVerificationTokenResponseBody>> => {
  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/email/validate`,
    data: {
      token,
    },
  });
};

/**
 * Request for password reset
 * @param {string} email user email address
 * @returns {Promise<AxiosResponse<IAuthPasswordResetResponseBody>>} response
 */
export const requestPasswordReset = async (
  email: string,
): Promise<AxiosResponse<IAuthPasswordResetResponseBody>> => {
  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/password/reset`,
    data: {
      email,
    },
  });
};

/**
 * Validate reset password token
 * @param {string} token reset password token
 * @returns {Promise<AxiosResponse<IPasswordResetValidationTokenResponseBody>>} response
 */
export const validateResetPasswordToken = async (
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
export const setNewPassword = async ({
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

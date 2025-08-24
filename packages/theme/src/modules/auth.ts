import axios, { type AxiosResponse } from "axios";
import type {
  IAuthLoginRequestBody,
  IAuthLoginResponseBody,
  IAuthSignupResponseBody,
  TAuthSignupRequestBody,
} from "@logchimp/types";

import { VITE_API_URL } from "../constants";

interface SetNewPasswordArgs {
  token: string;
  password: string;
}

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
 * @returns {object} response
 */
export const verifyUserEmail = async (token: string) => {
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
 * @returns {object} response
 */
export const requestPasswordReset = async (email: string) => {
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
 * @returns {object} response
 */
export const validateResetPasswordToken = async (token: string) => {
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
 * @returns {object} response
 */
export const setNewPassword = async ({
  token,
  password,
}: SetNewPasswordArgs) => {
  return await axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/password/set`,
    data: {
      token,
      password,
    },
  });
};

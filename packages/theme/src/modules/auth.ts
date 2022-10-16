// packges
import axios, { AxiosResponse } from "axios";
import { UserType } from "./users";

interface AuthenticateUserArgs {
  email: string;
  password: string;
}

interface SetNewPasswordArgs {
  token: string;
  password: string;
}

interface AuthenticateUserType extends UserType {
  email: string;
  authToken: string;
}

/**
 * Sign in to user account
 *
 * @param {string} email user email address
 * @param {string} password user password
 * @returns {object} response
 */
export const signin = async ({
  email,
  password,
}: AuthenticateUserArgs): Promise<
  AxiosResponse<{
    user: AuthenticateUserType;
  }>
> => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/login",
    data: {
      email,
      password,
    },
  });
};

/**
 * Create user account
 *
 * @param {string} email user email address
 * @param {string} password user password
 * @returns {object} response
 */
export const signup = async ({ email, password }: AuthenticateUserArgs) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/signup",
    data: {
      email,
      password,
    },
  });
};

/**
 * Resend user verification
 *
 * @param {string} email email address
 * @returns {object} response
 */
export const resendUserVerificationEmail = async (email: string) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/email/verify",
    data: {
      email,
    },
  });
};

/**
 * Validate user email address
 *
 * @param {string} token email address verification token
 *
 * @returns {object} response
 */
export const verifyUserEmail = async (token: string) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/email/validate",
    data: {
      token,
    },
  });
};

/**
 * Request for password reset
 *
 * @param {string} email user email address
 *
 * @returns {object} response
 */
export const requestPasswordReset = async (email: string) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/password/reset",
    data: {
      email,
    },
  });
};

/**
 * Validate reset password token
 *
 * @param {string} token reset password token
 *
 * @returns {object} response
 */
export const validateResetPasswordToken = async (token: string) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/password/validateToken",
    data: {
      token,
    },
  });
};

/**
 * Set new password
 *
 * @param {string} token reset password token
 * @param {string} password new password
 *
 * @returns {object} response
 */
export const setNewPassword = async ({
  token,
  password,
}: SetNewPasswordArgs) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/password/set",
    data: {
      token,
      password,
    },
  });
};

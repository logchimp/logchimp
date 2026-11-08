import type { components } from "@logchimp/api-ts-types";

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
   * @returns {Promise<components["schemas"]["LoginResponseBody"]>} response
   */
  Signin = async ({
    email,
    password,
  }: components["schemas"]["LoginRequestBody"]): Promise<
    components["schemas"]["LoginResponseBody"]
  > => {
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
   * @returns {Promise<components["schemas"]["SignupResponseBody"]>} response
   */
  Signup = async ({
    email,
    password,
  }: components["schemas"]["LoginRequestBody"]): Promise<
    components["schemas"]["SignupResponseBody"]
  > => {
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
   * @returns {Promise<components['schemas']['ValidateEmailVerificationTokenResponseBody']>} response
   */
  VerifyUserEmail = async (
    token: string,
  ): Promise<
    components["schemas"]["ValidateEmailVerificationTokenResponseBody"]
  > => {
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
   * @returns {Promise<components["schemas"]["SendPasswordResetEmailResponseBody"]>} response
   */
  RequestPasswordReset = async (
    email: string,
  ): Promise<components["schemas"]["SendPasswordResetEmailResponseBody"]> => {
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
   * @returns {Promise<components['schemas']['ValidatePasswordResetTokenResponseBody']>} response
   */
  ValidateResetPasswordToken = async (
    token: string,
  ): Promise<
    components["schemas"]["ValidatePasswordResetTokenResponseBody"]
  > => {
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
   * @returns {Promise<components["schemas"]["SetNewPasswordResponseBody"]>} response
   */
  SetNewPassword = async ({
    token,
    password,
  }: components["schemas"]["SetNewPasswordRequestBody"]): Promise<
    components["schemas"]["SetNewPasswordResponseBody"]
  > => {
    return this.post("/v1/auth/password/set", {
      token,
      password,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };

  getMe = async (): Promise<components["schemas"]["AuthMeResponseBody"]> => {
    return this.get("/v1/auth/me")
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  };
}

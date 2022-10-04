// packges
import axios from "axios";

/**
 * Sign in to user account
 *
 * @param {string} email user email address
 * @param {string} password user password
 * @returns {object} response
 */
export const signin = async (email, password) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/login",
    data: {
      email,
      password
    }
  });
};

/**
 * Create user account
 *
 * @param {string} email user email address
 * @param {string} password user password
 * @returns {object} response
 */
export const signup = async (email, password) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/signup",
    data: {
      email,
      password
    }
  });
};

/**
 * Resend user verification
 *
 * @param {string} email email address
 * @returns {object} response
 */
export const resendUserVerificationEmail = async email => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/email/verify",
    data: {
      email
    }
  });
};

/**
 * Validate user email address
 *
 * @param {string} token email address verification token
 *
 * @returns {object} response
 */
export const verifyUserEmail = async token => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/email/validate",
    data: {
      token
    }
  });
};

/**
 * Request for password reset
 *
 * @param {string} email user email address
 *
 * @returns {object} response
 */
export const requestPasswordReset = async email => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/password/reset",
    data: {
      email
    }
  });
};

/**
 * Validate reset password token
 *
 * @param {string} token reset password token
 *
 * @returns {object} response
 */
export const validateResetPasswordToken = async token => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/password/validateToken",
    data: {
      token
    }
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
export const setNewPassword = async (token, password) => {
  return await axios({
    method: "POST",
    url: "/api/v1/auth/password/set",
    data: {
      token,
      password
    }
  });
};

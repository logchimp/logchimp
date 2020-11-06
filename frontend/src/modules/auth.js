// packges
import axios from "axios";

/**
 * Sign in to user account
 *
 * @param {emailAddress} string user email address
 * @param {password} string user password
 */
export const signin = async (emailAddress, password) => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/login",
		data: {
			emailAddress,
			password
		}
	});
};

/**
 * Create user account
 *
 * @param {emailAddress} string user email address
 * @param {password} string user password
 */
export const signup = async (
	emailAddress,
	password,
	fullName = null,
	isOwner = null
) => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/signup",
		data: {
			emailAddress,
			password,
			fullName,
			isOwner
		}
	});
};

/**
 * Resend user verification
 *
 * @param {string} emailAddress email address
 */
export const resendUserVerificationEmail = async emailAddress => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/email/verify",
		data: {
			emailAddress
		}
	});
};

/**
 * Validate user email address
 *
 * @param {string} token email address verification token
 */
export const verifyUserEmailAddress = async token => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/email/validate",
		data: {
			token
		}
	});
};

/**
 * Request for password reset
 *
 * @param {emailAddress} string user email address
 */
export const requestPasswordReset = async emailAddress => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/password/reset",
		data: {
			emailAddress
		}
	});
};

/**
 * Validate reset password token
 *
 * @param {token} string reset password token
 */
export const validateResetPasswordToken = async token => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/password/validateToken",
		data: {
			token
		}
	});
};

/**
 * Set new password
 *
 * @param {token} string reset password token
 * @param {password} string new password
 */
export const setNewPassword = async (token, password) => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/password/set",
		data: {
			resetPasswordToken: token,
			password
		}
	});
};

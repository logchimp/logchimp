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
 * Verify user email address
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

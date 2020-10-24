// packges
import axios from "axios";

// store
import store from "../store";

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
export const signup = async (emailAddress, password) => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/signup",
		data: {
			emailAddress,
			password
		}
	});
};

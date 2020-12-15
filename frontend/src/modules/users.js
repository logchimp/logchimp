// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Get user settings
 *
 * @param {userId} string user UUID
 */
export const getUserSettings = async () => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "get",
		url: `/api/v1/users/profile`,
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

/**
 *	Update user settings
 *
 * @param {user} object user data object
 */
export const updateUserSettings = async user => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "patch",
		url: "/api/v1/users/profile",
		data: {
			...user
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

/**
 *	Get all users
 *
 * @param {page} integer page number default to 1
 * @param {sort} string sort type asc or desc
 */
export const getAllUsers = async (page, sort) => {
	return await axios({
		method: "get",
		url: "/api/v1/users",
		params: {
			page,
			created: sort
		}
	});
};

/**
 *	Check if user have access to dashboard
 *
 * @param {userId} string user UUID
 */
export const checkUserDashboardAccess = async userId => {
	return await axios({
		method: "get",
		url: `/api/v1/user/accessDashboard/${userId}`
	});
};

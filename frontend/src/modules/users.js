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
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "get",
		url: `/api/v1/users/${userId}`
	});
};

/**
 *	Update user settings
 *
 * @param {user} object user data object
 */
export const updateUserSettings = async user => {
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "patch",
		url: "/api/v1/user",
		data: {
			userId,
			firstname: user.firstname,
			lastname: user.lastname
		}
	});
};

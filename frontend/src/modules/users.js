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

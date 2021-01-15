// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Create role
 *
 * @returns {object} response
 */
export const createRole = async () => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "POST",
		url: "/api/v1/roles",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

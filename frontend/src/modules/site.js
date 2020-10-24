// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Update site settings
 *
 * @param {site} object site data
 */
export const updateSettings = async site => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "patch",
		url: "/api/v1/settings/site",
		data: {
			...site
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

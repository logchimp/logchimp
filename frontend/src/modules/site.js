// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Get site settings
 */
export const isSiteSetup = async () => {
	return await axios({
		method: "get",
		url: "/api/v1/auth/isSetup"
	});
};

/**
 * Get site settings
 */
export const getSettings = async () => {
	return await axios({
		method: "get",
		url: "/api/v1/settings/site"
	});
};

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

/**
 * upload site logo
 *
 * @param {logo} FormData logo (image file)
 */
export const uploadSiteLogo = async logo => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "post",
		url: "/api/v1/settings/update-logo",
		data: logo,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "multipart/form-data"
		}
	});
};

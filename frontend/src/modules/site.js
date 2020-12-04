// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Create owner account while setting up LogChimp site.
 *
 * @param {string} siteTitle - site title
 * @param {string} name - user name
 * @param {string} email - user email address
 * @param {string} password - user password
 */
export const siteSetup = async (siteTitle, name, email, password) => {
	return await axios({
		method: "post",
		url: "/api/v1/auth/setup",
		data: {
			siteTitle,
			name,
			email,
			password
		}
	});
};

/**
 * Get site settings
 */
export const isSiteSetup = async () => {
	return await axios({
		method: "get",
		url: "/api/v1/auth/setup"
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

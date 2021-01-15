// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get all roles
 *
 * @returns {object} response
 */
export const getAllRoles = async () => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "GET",
		url: "/api/v1/roles",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

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

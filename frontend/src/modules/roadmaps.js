// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get all roadmaps
 *
 * @returns {object} response
 */
export const getAllRoadmaps = async () => {
	return await axios({
		method: "GET",
		url: "/api/v1/roadmaps"
	});
};

/**
 * Create new roadmap
 *
 * @returns {object} response
 */
export const createRoadmap = async () => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "POST",
		url: "/api/v1/roadmaps",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

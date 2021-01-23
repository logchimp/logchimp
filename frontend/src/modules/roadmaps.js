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

/**
 * Sort roadmap
 *
 * @param {object} roadmap two roadmap objects which will swap places
 * @param {object} roadmap.from from roadmap object
 * @param {string} roadmap.from.id from roadmap UUID
 * @param {number} roadmap.from.index from roadmap index
 * @param {object} roadmap.to to roadmap object
 * @param {string} roadmap.to.id to roadmap UUID
 * @param {number} roadmap.to.index to roadmap index
 *
 * @returns {object} response
 */
export const sortRoadmap = async ({ from, to }) => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "PATCH",
		url: "/api/v1/roadmaps/sort",
		data: {
			from,
			to
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

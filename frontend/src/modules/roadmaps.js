// packges
import axios from "axios";

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

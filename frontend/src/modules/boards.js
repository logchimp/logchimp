// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get all boards
 *
 * @param {number} page page number default to 1
 * @param {string} sort sort type asc or desc
 *
 * @returns {object} response
 */
export const getAllBoards = async (page = 1, limit, sort = "desc") => {
	return await axios({
		method: "get",
		url: "/api/v1/boards",
		params: {
			page,
			limit,
			created: sort
		}
	});
};

/**
 *	Get board by URL
 *
 * @param {string} url board url
 *
 * @returns {object} response
 */
export const getBoardByUrl = async url => {
	return await axios({
		method: "GET",
		url: `/api/v1/boards/${url}`
	});
};

/**
 * Create new board
 *
 * @param {name} string Board name
 *
 * @returns {object} response
 */
export const createBoard = async name => {
	const token = store.getters["user/getAuthToken"];
	return await axios({
		method: "POST",
		url: "/api/v1/boards",
		data: {
			name
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

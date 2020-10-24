// packges
import axios from "axios";

// store
import store from "../store";

/**
 *	Get all boards
 *
 * @param {page} integer page number default to 1
 * @param {sort} string sort type asc or desc
 */
export const getAllBoards = async (page = 1, sort = "desc") => {
	return await axios({
		method: "get",
		url: "/api/v1/boards",
		params: {
			page: page,
			created: sort
		}
	});
};

/**
 * Get board posts
 *
 * @param {url} string board url posts
 * @param {page} integer page number default to 1
 * @param {sort} string sort type asc or desc
 */
export const getBoardPosts = async (url, page = 1, sort) => {
	return await axios({
		method: "post",
		url: `/api/v1/boards/${url}/posts`,
		params: {
			page: page,
			created: sort
		}
	});
};

/**
 * Create new board
 *
 * @param {name} string Board name
 */
export const createBoard = async name => {
	const token = store.getters["user/getAuthToken"];
	return await axios({
		method: "post",
		url: "/api/v1/boards",
		data: {
			name
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

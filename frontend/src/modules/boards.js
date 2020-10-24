// packges
import axios from "axios";

// store
import store from "../store";

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


// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Create post
 *
 * @param {boardId} string board UUID
 * @param {post} object post title and description
 */
export const createPost = async (boardId, post) => {
	const token = store.getters["user/getAuthToken"];
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "post",
		url: "/api/v1/posts",
		data: {
			title: post.title,
			contentMarkdown: post.description,
			userId,
			boardId
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

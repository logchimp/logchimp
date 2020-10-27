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

/**
 * Get posts
 *
 * @param {page} integer page number default to 1
 * @param {sort} string sort type asc or desc
 */
export const getPosts = async (page = 1, limit, sort) => {
	return await axios({
		method: "get",
		url: "/api/v1/posts",
		params: {
			page,
			limit,
			created: sort
		}
	});
};

/**
 * Get post by slug
 *
 * @param {slug} string post slug
 */
export const getPostBySlug = async slug => {
	return await axios({
		method: "get",
		url: `/api/v1/posts/${slug}`
	});
};

/**
 * Update post
 *
 * @param {postId} string post UUID
 * @param {post} object post data
 */
export const updatePost = async (postId, post) => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "patch",
		url: `/api/v1/posts/${postId}`,
		data: {
			...post
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

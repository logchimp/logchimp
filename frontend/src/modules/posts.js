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
 * @param {integer} page - number default to 1
 * @param {integer} limit - number of posts to fetch
 * @param {string} sort - createdAt sort type ASC or DESC
 * @param {string} userId - logged in user ID
 * @param {string[]} boardId - array of board IDs
 */
export const getPosts = async (
	page = 1,
	limit = 10,
	sort = "DESC",
	userId,
	boardId
) => {
	return await axios({
		method: "post",
		url: "/api/v1/posts/get",
		data: {
			page,
			limit,
			created: sort,
			userId,
			boardId
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

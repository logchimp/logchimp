// packges
import axios from "axios";

// store
import store from "../store";

/**
 * Create post
 *
 * @param {boardId} string board UUID
 * @param {post} object post title and description
 *
 * @returns {object} response
 */
export const createPost = async (boardId, post) => {
	const token = store.getters["user/getAuthToken"];
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "POST",
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
 * @param {number} page number default to 1
 * @param {number} limit number of posts to fetch
 * @param {string} sort createdAt sort type ASC or DESC
 * @param {string} userId logged in user UUID
 * @param {string[]} boardId array of board UUIDs
 * @param {string} roadmapId array of roadmap UUIDs
 *
 * @returns {object} response
 */
export const getPosts = async (
	page = 1,
	limit = 10,
	sort = "DESC",
	boardId,
	roadmapId
) => {
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "POST",
		url: "/api/v1/posts/get",
		data: {
			page,
			limit,
			created: sort,
			userId,
			boardId,
			roadmapId
		}
	});
};

/**
 * Get post by slug
 *
 * @param {slug} string post slug
 *
 * @returns {object} response
 */
export const getPostBySlug = async slug => {
	const userId = store.getters["user/getUserId"];

	return await axios({
		method: "POST",
		url: `/api/v1/posts/slug`,
		data: {
			slug,
			userId
		}
	});
};

/**
 * Update post
 *
 * @param {object} post update post data
 * @param {string} post.id post UUID
 * @param {string} post.title post title
 * @param {string} post.contentMarkdown post body in markdown format
 * @param {string} post.slugId post slug UUID
 * @param {string} post.userId post author UUID
 *
 * @returns {object} response
 */
export const updatePost = async post => {
	const token = store.getters["user/getAuthToken"];

	return await axios({
		method: "PATCH",
		url: "/api/v1/posts",
		data: {
			...post
		},
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

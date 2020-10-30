const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

/**
 * Get post by ID
 *
 * @param {string} postId Post UUID
 */
const getPostById = async postId => {
	if (!postId) {
		return {
			message: error.api.posts.postIdMissing,
			code: "MISSING_POST_ID"
		};
	}

	try {
		const posts = await database
			.select()
			.from("posts")
			.where({
				postId
			})
			.limit(1);

		const post = posts[0];

		if (!post) {
			return null;
		}

		return post;
	} catch (err) {
		logger.error(err);
	}
};

module.exports = getPostById;

const database = require("../../database");

// services
const getPostById = require("../../services/posts/getPostById");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.updatePost = async (req, res) => {
	const postId = req.params.postId;
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;

	if (!title) {
		res.status(400).send({
			message: error.api.posts.titleMissing,
			code: "MISSING_POST_TITLE"
		});
		return;
	}

	if (!postId) {
		res.status(400).send({
			message: error.api.posts.postIdMissing,
			code: "MISSING_POST_ID"
		});
		return;
	}

	try {
		const getPost = await getPostById(postId);

		if (!getPost) {
			res.status(404).send({
				message: error.api.posts.postNotFound,
				code: "POST_NOT_FOUND"
			});
			return;
		}

		const slug = `${title
			.replace(/[^\w\s]/gi, "")
			.replace(/\s\s+/gi, " ")
			.toLowerCase()
			.split(" ")
			.join("-")}-${getPost.slugId}`;

		const posts = await database
			.update({
				title,
				slug,
				contentMarkdown,
				updatedAt: new Date().toJSON()
			})
			.from("posts")
			.where({
				postId
			})
			.returning("*");

		const post = posts[0];

		res.status(200).send(post);
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

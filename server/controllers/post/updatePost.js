const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.updatePost = async (req, res) => {
	const userId = req.user.userId;
	const userRole = req.user.roles[0];
	const permissions = req.user.permissions;
	const authorId = req.post.userId;
	const slugId = req.post.slugId;

	const id = req.body.id;
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;

	const checkPermission = permissions.includes("post:create");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.roles.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	if (userRole.name === "user" && userId !== authorId) {
		return res.status(403).send({
			message: error.api.posts.notAnAuthor,
			code: "POST_AUTHOR"
		});
	}

	const slug = `${title
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-")}-${slugId}`;

	try {
		const posts = await database
			.update({
				title,
				slug,
				contentMarkdown,
				updatedAt: new Date().toJSON()
			})
			.from("posts")
			.where({
				postId: id
			})
			.returning("*");

		const post = posts[0];

		res.status(200).send({ post });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

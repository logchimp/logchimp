const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.updatePost = async (req, res) => {
	const postId = req.params.postId;
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;
	const slugId = req.body.slugId;

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

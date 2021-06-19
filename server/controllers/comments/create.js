const { v4: uuid } = require("uuid");

const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const userId = req.user.userId;
	const { post_id, parent_id, is_internal, body } = req.body;

	// check auth user has required permission to set comment as internal
	// check the auth user has permission to comment

	try {
		const comment = await database
			.insert({
				id: uuid(),
				parent_id,
				body,
				type: "comment",
				author_id: userId,
				post_id,
				is_internal,
				created_at: new Date().toJSON(),
				updated_at: new Date().toJSON()
			})
			.into("posts_comments")
			.returning("*");

		res.status(201).send({
			comment: comment[0]
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

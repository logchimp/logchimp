const { v4: uuid } = require("uuid");

const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");

module.exports = async (req, res) => {
	const userId = req.user.userId;
	const { post_id } = req.params;
	const { parent_id, is_internal, body } = req.body;

	// check auth user has required permission to set comment as internal
	// check the auth user has permission to comment

	try {
		const results = await database.transaction(async (trx) => {
			// postActivityId will be shared b/w "posts_comments" and "posts_activity" table
			const postActivityId = uuid();

			const comments = await trx("posts_comments").insert(
				{
					id: uuid(),
					parent_id,
					body,
					activity_id: postActivityId,
					is_internal,
					created_at: new Date().toJSON(),
					updated_at: new Date().toJSON()
				},
				"*"
			);

			const comment = comments[0];
			await database("posts_activity")
				.insert({
					id: postActivityId,
					type: "comment",
					posts_comments_id: comment.id,
					post_id,
					author_id: userId,
					created_at: new Date().toJSON()
				})
				.transacting(trx);

			const author = await database
				.select("userId", "name", "username", "avatar")
				.from("users")
				.where({ userId })
				.first();

			return {
				...comment,
				author
			}
		});

		res.status(201).send({
			comment: results
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

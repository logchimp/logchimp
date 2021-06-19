const { v4: uuid } = require("uuid");

const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const { comment_id } = req.params;
	const { body, is_internal, is_spam } = req.body;

	try {
		const comment = await database
			.update({
				body,
				is_internal,
				is_edited: true,
				is_spam,
				created_at: new Date().toJSON(),
				updated_at: new Date().toJSON()
			})
			.from("post_activity")
			.where({ id: comment_id })
			.returning("*");

		res.status(200).send({
			comment: comment[0]
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.isSetup = async (req, res) => {
	try {
		const isOwner = await database
			.select()
			.from("users")
			.where({
				isOwner: true
			})
			.limit(1);

		const owner = isOwner[0];
		if (owner) {
			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				isSetup: true
			});
		} else {
			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				isSetup: false
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

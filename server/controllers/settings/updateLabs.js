const _ = require("lodash");

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

/**
 * This API doesn't update the existing labs value
 * instead overrides the existing value with req.body.labs
 */
exports.updateLabs = async (req, res) => {
	const labs = req.body;
	const stringify = JSON.stringify(labs);

	try {
		const response = await database
			.update({
				labs: database.raw(`labs::jsonb || '${stringify}'`)
			})
			.from("settings")
			.returning(database.raw("labs::json"));

		const labs = response[0];
		res.status(200).send({
			labs
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

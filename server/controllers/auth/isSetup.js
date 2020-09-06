// database
const database = require("../../database");

exports.isSetup = async (req, res) => {
	const isOwner = await database
		.select()
		.from("users")
		.where({
			isOwner: true
		})
		.limit(1);

	try {
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
	} catch (error) {
		console.error(error);
	}
};

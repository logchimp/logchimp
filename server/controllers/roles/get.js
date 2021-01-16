// database
const database = require("../../database");

module.exports = async (req, res) => {
	try {
		const roles = await database.select().from("roles");

		res.status(200).send({ roles });
	} catch (error) {
		console.log(error);
	}
};

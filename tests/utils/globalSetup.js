const database = require("../../server/database");

module.exports = () => database.migrate
	.latest()
	.then(() => {
		console.log("Running all migrations...");
	})
	.catch((err) => console.log(err));

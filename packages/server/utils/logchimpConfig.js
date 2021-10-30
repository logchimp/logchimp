const path = require("path");
const fs = require("fs-extra");

const config = () => {
	try {
		const result = fs.readJsonSync(
			path.resolve(__dirname, "../../../logchimp.config.json")
		);

		return result;
	} catch (error) {
		return false;
	}
};

module.exports = config;

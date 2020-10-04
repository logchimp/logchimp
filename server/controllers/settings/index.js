const siteSettings = require("./siteSettings");
const update = require("./update");

module.exports = {
	...siteSettings,
	...update
};

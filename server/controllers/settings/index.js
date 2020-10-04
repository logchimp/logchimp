const siteSettings = require("./siteSettings");
const update = require("./update");
const updateLogo = require("./updateLogo");

module.exports = {
	...siteSettings,
	...update,
	...updateLogo
};

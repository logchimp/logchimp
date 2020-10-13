const jestConfig = require("../jest.config.js");

module.exports = {
	displayName: "server",
	testTimeout: 20000,
	...jestConfig
};

const jestConfig = require("../jest.config.js");

module.exports = {
	displayName: "server",
	setupFiles: ["dotenv/config"],
	testTimeout: 20000,
	...jestConfig
};

const jestConfig = require("../jest.config.js");

module.exports = {
	...jestConfig,
	displayName: "server",
	testTimeout: 20000,
	setupFilesAfterEnv: ["./tests/setupTest.js"]
};

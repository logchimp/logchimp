const jestConfig = require("../jest.config.js");

module.exports = {
	...jestConfig,
	displayName: "server",
	setupFilesAfterEnv: ["./tests/setupTest.js"]
};

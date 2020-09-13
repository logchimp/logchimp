const jestConfig = require("../jest.config.js")

module.exports = {
	displayName: "server",
	slowTestThreshold: 4,
	setupFiles: ["dotenv/config"],
	...jestConfig
};

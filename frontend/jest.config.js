const jestConfig = require("../jest.config.js");

module.exports = {
	...jestConfig,
	displayName: "client",
	moduleFileExtensions: ["js", "vue"],
	transform: {
		".*\\.(js)$": "babel-jest",
		".*\\.(vue)$": "vue-jest"
	}
};

module.exports = {
	displayName: "server",
	verbose: true,
	setupFilesAfterEnv: ["./tests/setupTest.js"],
	testPathIgnorePatterns: ["./frontend"]
};

module.exports = {
	root: true,
	parserOptions: {
		sourceType: "module",
		allowImportExportEverywhere: true
	},
	env: {
		node: true,
		es6: true
	},
	plugins: ["prettier"],
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
	overrides: [
		{
			files: ["**/*.test.js", "**/*.spec.js"],
			env: {
				jest: true
			},
			plugins: ["jest"]
		}
	]
};

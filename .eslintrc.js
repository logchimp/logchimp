module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	plugins: ["vue", "prettier"],
	extends: [
		"eslint:recommended",
		"plugin:vue/recommended",
		"plugin:prettier/recommended",
	],
	rules: {
		"vue/html-indent": [1, "tab"],
	},
	overrides: [
		{
			files: ["**/*.test.js"],
			env: {
				jest: true,
			},
			plugins: ["jest"],
		},
	],
};

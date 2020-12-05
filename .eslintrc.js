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
		"prettier/prettier": 1,
		camelcase: 1,
		"no-console": 1,
		"vue/camelcase": "error"
	}
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

module.exports = {
	root: true,
	parserOptions: {
		parser: "babel-eslint",
		sourceType: "module",
		ecmaVersion: 8
	},
	env: {
		browser: true,
		node: true,
		"jest/globals": true
	},
	extends: [
		"eslint:recommended",
		"plugin:vue/essential",
		"plugin:prettier/recommended",
		"plugin:jest/recommended",
		"plugin:jest/style"
	],
	rules: {
		"prettier/prettier": 1,
		camelcase: 1,
		"no-console": 1,
		"vue/camelcase": "error"
	}
};

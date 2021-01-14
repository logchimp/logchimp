module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es6: true
	},
	plugins: ["vue", "prettier"],
	extends: ["eslint:recommended", "plugin:vue/recommended"],
	rules: {
		"vue/html-indent": [1, "tab"],
		"vue/max-attributes-per-line": [
			2,
			{
				singleline: 2,
				multiline: {
					max: 1,
					allowFirstLine: false
				}
			}
		]
	},
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

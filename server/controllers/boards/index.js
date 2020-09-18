const create = require("./create");
const filter = require("./filter");
const boardBySlug = require("./boardBySlug");

module.exports = {
	...create,
	...filter,
	...boardBySlug
};

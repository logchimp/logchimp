const create = require("./create");
const filter = require("./filter");
const boardBySlug = require("./boardBySlug");
const deleteById = require("./deleteById");

module.exports = {
	...create,
	...filter,
	...boardBySlug,
	deleteById
};

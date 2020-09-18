const create = require("./create");
const filter = require("./filter");
const boardBySlug = require("./boardBySlug");
const boardPosts = require("./boardPosts");

module.exports = {
	...create,
	...filter,
	...boardBySlug,
	...boardPosts
};

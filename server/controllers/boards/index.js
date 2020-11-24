const create = require("./create");
const filter = require("./filter");
const boardBySlug = require("./boardBySlug");
const boardPosts = require("./boardPosts");
const deleteBoard = require("./deleteBoard");

module.exports = {
	...create,
	...filter,
	...boardBySlug,
	...boardPosts,
	...deleteBoard
};

const create = require("./create");
const filterPost = require("./filterPost");
const postBySlug = require("./postBySlug");
const updatePost = require("./updatePost");
const deleteById = require("./deleteById");

module.exports = {
	...create,
	...filterPost,
	...postBySlug,
	...updatePost,
	...deleteById
};

const upvote = require("./upvote");
const deleteById = require("./deleteById")

module.exports = {
	...upvote,
	...deleteById
};

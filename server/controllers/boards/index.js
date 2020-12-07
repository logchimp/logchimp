const create = require("./create");
const filter = require("./filter");
const boardByUrl = require("./boardByUrl");
const deleteById = require("./deleteById");

module.exports = {
	...create,
	...filter,
	boardByUrl,
	deleteById
};

const create = require("./create");
const filter = require("./filter");
const checkName = require("./checkName");
const boardByUrl = require("./boardByUrl");
const deleteById = require("./deleteById");

module.exports = {
	...create,
	...filter,
	checkName,
	boardByUrl,
	deleteById
};

const create = require("./create");
const filter = require("./filter");
const checkName = require("./checkName");
const boardByUrl = require("./boardByUrl");
const updateBoard = require("./updateBoard");
const deleteById = require("./deleteById");

module.exports = {
	...create,
	...filter,
	checkName,
	boardByUrl,
	updateBoard,
	deleteById
};

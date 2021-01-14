const create = require("./create");
const filter = require("./filter");
const get = require("./get");
const checkName = require("./checkName");
const boardByUrl = require("./boardByUrl");
const updateBoard = require("./updateBoard");
const deleteById = require("./deleteById");

module.exports = {
	...create,
	...filter,
	get,
	checkName,
	boardByUrl,
	updateBoard,
	deleteById
};

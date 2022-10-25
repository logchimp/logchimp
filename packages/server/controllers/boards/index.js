const create = require("./create");
const filter = require("./filter");
const get = require("./get");
const searchBoard = require("./searchBoard");
const checkName = require("./checkName");
const boardByUrl = require("./boardByUrl");
const updateBoard = require("./updateBoard");
const deleteById = require("./deleteById");

module.exports = {
  ...create,
  ...filter,
  get,
  searchBoard,
  checkName,
  boardByUrl,
  updateBoard,
  deleteById,
};

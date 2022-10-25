const create = require("./create");
const filterPost = require("./filterPost");
const postBySlug = require("./postBySlug");
const updatePost = require("./updatePost");
const deleteById = require("./deleteById");

const activity = require("./activity");
const comments = require("./comments");

module.exports = {
  ...create,
  ...filterPost,
  ...postBySlug,
  ...updatePost,
  ...deleteById,
  activity,
  comments,
};

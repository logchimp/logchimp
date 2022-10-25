const database = require("../database");

// utils
const { validUUID } = require("../helpers");
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
  const id = validUUID(req.body.id);
  const slug = req.body.slug;

  const post = await database
    .select()
    .from("posts")
    .where({
      postId: id || null,
    })
    .orWhere({
      slug: slug || null,
    })
    .first();

  if (!post) {
    return res.status(404).send({
      message: error.api.posts.postNotFound,
      code: "POST_NOT_FOUND",
    });
  }

  req.post = post;
  next();
};

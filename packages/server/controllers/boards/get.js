const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const created = req.query.created;
  const page = req.query.page - 1;
  const limit = req.query.limit || 10;

  try {
    const boards = await database
      .select(
        "boards.boardId",
        "boards.name",
        "boards.color",
        "boards.url",
        "boards.display",
      )
      .count("posts", { as: "post_count" })
      .from("boards")
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .groupBy("boards.boardId")
      .orderBy("boards.createdAt", created)
      .limit(limit)
      .offset(limit * page);

    res.status(200).send({ boards });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

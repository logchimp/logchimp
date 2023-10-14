const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  try {
    const roadmaps = await database
      .select("id", "name", "url", "color", "display", "index")
      .from("roadmaps")
      .orderBy("index", "asc");

    res.status(200).send({ roadmaps });
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

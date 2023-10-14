// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.getLabs = async (_, res) => {
  try {
    const { labs } = await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first();

    res.status(200).send({
      labs,
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

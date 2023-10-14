// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.siteSettings = async (_, res) => {
  try {
    const settings = await database
      .select(["*", database.raw("labs::json")])
      .from("settings")
      .first();

    res.status(200).send({
      settings,
    });
  } catch (err) {
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

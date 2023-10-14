// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

const isSiteSetup = async (req, res) => {
  try {
    const isSetup = await database
      .select("userId")
      .from("users")
      .where({
        isOwner: true,
      })
      .first();

    res.status(200).send({
      is_setup: typeof isSetup !== "undefined",
    });
  } catch (err) {
    logger.error({
      message: err.message,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

module.exports = isSiteSetup;

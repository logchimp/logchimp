// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

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
  }
};

module.exports = isSiteSetup;

const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");

module.exports = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const labSettings = await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first();

    if (!labSettings.labs.comments) {
      return res.status(403).send({
        message: error.api.labs.disabled,
        code: "LABS_DISABLED",
      });
    }

    await database.delete().from("posts_comments").where({ id: comment_id });

    res.status(204);
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

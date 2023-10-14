const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");

module.exports = async (req, res) => {
  const { comment_id } = req.params;
  const { body, is_internal, is_spam } = req.body;

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

    const comment = await database
      .update({
        body,
        is_internal,
        is_edited: true,
        is_spam,
        created_at: new Date().toJSON(),
        updated_at: new Date().toJSON(),
      })
      .from("posts_comments")
      .where({ id: comment_id })
      .returning("*");

    res.status(200).send({
      comment: comment[0],
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

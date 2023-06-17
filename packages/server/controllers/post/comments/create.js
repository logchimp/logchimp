const { v4: uuid } = require("uuid");

const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");

module.exports = async (req, res) => {
  const userId = req.user.userId;
  const { post_id } = req.params;
  const { parent_id, is_internal, body } = req.body;

  // check auth user has required permission to set comment as internal
  // check the auth user has permission to comment

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

    const results = await database.transaction(async (trx) => {
      // postActivityId will be shared b/w "posts_comments" and "posts_activity" table
      const postActivityId = uuid();

      const comments = await trx("posts_comments").insert(
        {
          id: uuid(),
          parent_id,
          body,
          activity_id: postActivityId,
          is_internal,
          created_at: new Date().toJSON(),
          updated_at: new Date().toJSON(),
        },
        [
          "id",
          "parent_id",
          "body",
          "is_internal",
          "is_edited",
          "is_spam",
          "created_at",
        ],
      );

      const comment = comments[0];

      const activities = await trx("posts_activity")
        .insert({
          id: postActivityId,
          type: "comment",
          posts_comments_id: comment.id,
          post_id,
          author_id: userId,
          created_at: new Date().toJSON(),
        })
        .returning(["id", "type", "created_at"]);

      const activity = activities[0];

      const author = await trx("users")
        .select("userId", "name", "username", "avatar")
        .where({ userId })
        .first();

      return {
        ...activity,
        comment,
        author,
      };
    });

    res.status(201).send({
      comment: results,
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

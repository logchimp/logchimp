const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");

module.exports = async (req, res) => {
  const { post_id } = req.params;
  const { per_page = 10, page = 1 } = req.query;

  try {
    const activities = await database.raw(
      /* SQL */
      `
      SELECT
        id,
        type,
        CASE
          WHEN posts_comments_id IS NULL THEN NULL
          ELSE (
            SELECT
              json_build_object(
                'id', posts_comments.id,
                'parent_id', posts_comments.parent_id,
                'body', posts_comments.body,
                'is_internal', posts_comments.is_internal,
                'is_edited', posts_comments.is_edited,
                'is_spam', posts_comments.is_spam,
                'created_at', posts_comments.created_at
              )
            FROM posts_comments
            WHERE posts_comments.activity_id = posts_activity.id
          )
        END AS comment,
        (
          SELECT
            json_build_object(
              'user_id', users."userId",
              'name', users.name,
              'username', users.username,
              'avatar', users.avatar
            )
          FROM users WHERE users."userId" = posts_activity.author_id
        ) AS author,
        created_at
      FROM
        posts_activity
      WHERE
        posts_activity.post_id = :post_id
      ORDER BY
        posts_activity.created_at DESC
      LIMIT :limit
      OFFSET :offset
    ;`,
      {
        limit: per_page,
        offset: page,
        post_id,
      },
    );

    res.status(200).send({
      activity: activities.rows,
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

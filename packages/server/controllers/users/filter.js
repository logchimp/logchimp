// database
import database from "../../database";

// services
import getUsers from "../../services/users/getUsers";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function filter(req, res) {
  const created = req.query.created;
  const page = req.query.page - 1;
  const limit = req.query.limit || 10;

  try {
    const userData = await getUsers(created, limit, page);

    const users = [];

    for (let i = 0; i < userData.length; i++) {
      const userId = userData[i].userId;

      try {
        const postsCount = await database
          .count()
          .from("posts")
          .where({ userId });
        const votesCount = await database
          .count()
          .from("votes")
          .where({ userId });

        users.push({
          votes: votesCount[0].count,
          posts: postsCount[0].count,
          ...userData[i],
        });
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
      }
    }

    res.status(200).send({
      status: {
        code: 200,
        type: "success",
      },
      users,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function updateUserInfo(req, res) {
  const { user_id } = req.params;
  const { username, name, notes } = req.body;

  try {
    const user = await database
      .update({
        username,
        name,
        notes,
      })
      .from("users")
      .where({
        userId: user_id,
      });

    res.status(200).send({
      user,
    });
  } catch (error) {
    logger.error({
      message: error,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

module.exports = getUserInfo;

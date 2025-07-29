import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function getUserInfo(req, res) {
  const { user_id } = req.params;

  try {
    const user = await database
      .select(
        "userId",
        "name",
        "username",
        "email",
        "avatar",
        "isVerified",
        "isBlocked",
        "isOwner",
        "notes",
        "createdAt",
      )
      .from("users")
      .where({
        userId: user_id,
      })
      .first();

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

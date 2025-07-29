// database
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function isSiteSetup(_, res) {
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
    });
  }
}

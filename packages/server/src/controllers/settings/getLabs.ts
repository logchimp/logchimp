// database
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function getLabs(_, res) {
  try {
    // @ts-ignore
    const { labs } = await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first();

    res.status(200).send({
      labs,
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

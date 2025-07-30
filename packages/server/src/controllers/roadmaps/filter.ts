import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function filter(_, res) {
  try {
    const roadmaps = await database
      .select("id", "name", "url", "color", "display", "index")
      .from("roadmaps")
      .orderBy("index", "asc");

    res.status(200).send({ roadmaps });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

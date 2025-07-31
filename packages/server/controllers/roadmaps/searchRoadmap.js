import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function searchRoadmap(req, res) {
  const { name } = req.params;
  const permissions = req.user.permissions;

  const checkPermission = permissions.includes("roadmap:read");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const roadmaps = await database
      .select("id", "name", "url", "color")
      .from("roadmaps")
      .where("name", "ILIKE", `${name}%`);

    res.status(200).send({
      roadmaps,
    });
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

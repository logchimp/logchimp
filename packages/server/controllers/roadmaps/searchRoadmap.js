const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
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
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

// database
const database = require("../../database");

// utils
const error = require("../../errorResponse.json");
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("role:read");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const roles = await database.select().from("roles");

    res.status(200).send({ roles });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

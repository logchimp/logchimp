const { v4: uuid } = require("uuid");

const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const permissions = req.user.permissions;
  const { role_id, user_id } = req.params;

  const checkPermission = permissions.find((item) => item === "role:assign");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.posts.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const response = await database
      .insert({
        id: uuid(),
        role_id,
        user_id,
      })
      .into("roles_users")
      .onConflict(["role_id", "user_id"])
      .ignore();

    res.status(response.rowCount ? 200 : 204).send({
      success: response.rowCount,
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

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const { id } = req.params;

  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("role:read");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const role = await database
      .select()
      .from("roles")
      .where({
        id,
      })
      .first();

    const permissions = await database
      .select(
        database.raw("ARRAY_AGG(CONCAT(p.type, ':', p.action)) AS permissions"),
      )
      .from("permissions_roles AS pr")
      .leftJoin("permissions AS p", "pr.permission_id", "p.id")
      .where({
        "pr.role_id": role.id,
      })
      .first();

    if (!role) {
      res.status(404).send({
        message: error.api.roles.roleNotFound,
        code: "ROLE_NOT_FOUND",
      });
    }

    res.status(200).send({
      role: {
        ...role,
        permissions: permissions.permissions || [],
      },
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

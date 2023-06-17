const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const error = require("../../errorResponse.json");
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
  const role = req.body;

  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("role:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const existingPermissions = await database.select().from("permissions");

    // delete all existing permissions for a role
    await database.delete().from("permissions_roles").where({
      role_id: role.id,
    });

    const updateRole = await database
      .update({
        name: role.name,
        description: role.description,
        updated_at: new Date().toJSON(),
      })
      .from("roles")
      .where({
        id: role.id,
      })
      .returning("*");

    // add new permissions to the role
    role.permissions.forEach(async (perm) => {
      const type = perm.split(":")[0];
      const action = perm.split(":")[1];

      const findPermission = existingPermissions.find(
        (item) => item.type === type && item.action === action,
      );

      await database
        .insert({
          id: uuidv4(),
          permission_id: findPermission.id,
          role_id: role.id,
        })
        .into("permissions_roles");
    });

    const updatedPermissions = await database
      .select(
        database.raw("ARRAY_AGG(CONCAT(p.type, ':', p.action)) AS permissions"),
      )
      .from("permissions_roles AS pr")
      .leftJoin("permissions AS p", "pr.permission_id", "p.id")
      .where({
        "pr.role_id": role.id,
      })
      .first();

    res.status(200).send({
      role: updateRole,
      ...updatedPermissions,
    });
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

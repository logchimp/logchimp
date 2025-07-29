import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function deleteRoleFromUser(req, res) {
  const permissions = req.user.permissions;
  const { role_id, user_id } = req.params;

  const checkPermission = permissions.find((item) => item === "role:unassign");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.posts.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    await database.delete().from("roles_users").where({
      role_id,
      user_id,
    });

    res.sendStatus(204);
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

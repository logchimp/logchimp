import { v4 as uuidv4 } from "uuid";

// database
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

module.exports = async (req, res) => {
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("role:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const createRole = await database
      .insert({
        id: uuidv4(),
        name: "new role",
      })
      .into("roles")
      .returning("id");

    const role = createRole[0];

    res.status(201).send({
      role,
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
};

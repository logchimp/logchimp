const database = require("../../database");

// utils
const { validUUID } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.deleteById = async (req, res) => {
  const permissions = req.user.permissions;

  const id = validUUID(req.body.id);

  const checkPermission = permissions.includes("post:destroy");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    await database.delete().from("posts").where({
      postId: id,
    });

    res.sendStatus(204);
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

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

/**
 * This API doesn't update the existing labs value
 * instead overrides the existing value with req.body.labs
 */
exports.updateLabs = async (req, res) => {
  const permissions = req.user.permissions;

  const labs = req.body;
  const stringify = JSON.stringify(labs);

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.posts.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const response = await database
      .update({
        labs: database.raw(`labs::jsonb || '${stringify}'`),
      })
      .from("settings")
      .returning(database.raw("labs::json"));

    const labs = response[0];
    res.status(200).send({
      labs,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

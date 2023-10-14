// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.update = async (req, res) => {
  const permissions = req.user.permissions;

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.posts.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const {
    title,
    description,
    allowSignup,
    accentColor,
    googleAnalyticsId,
    developer_mode,
  } = req.body;

  try {
    const updateSettings = await database
      .update({
        title,
        description,
        allowSignup,
        accentColor,
        googleAnalyticsId,
        developer_mode,
      })
      .from("settings")
      .returning(["*", database.raw("labs::json")]);

    const settings = updateSettings[0];

    res.status(200).send({
      settings,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const { from, to } = req.body;
  const permissions = req.user.permissions;

  const checkPermission = permissions.includes("roadmap:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    // to
    await database
      .update({
        index: to.index,
      })
      .from("roadmaps")
      .where({
        id: to.id,
      });

    // from
    await database
      .update({
        index: from.index,
      })
      .from("roadmaps")
      .where({
        id: from.id,
      });

    res.sendStatus(200);
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

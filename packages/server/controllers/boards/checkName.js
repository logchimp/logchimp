const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const permissions = req.user.permissions;

  const name = req.body.name;

  const checkPermission = permissions.includes("board:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  if (!name) {
    return res.status(400).send({
      errors: [
        name
          ? ""
          : {
              message: error.api.boards.nameMissing,
              code: "BOARD_NAME_MISSING",
            },
      ],
    });
  }

  const slimUrl = name.replace(/[^\w]+/gi, "-").trim().toLowerCase();

  try {
    const board = await database
      .select()
      .from("boards")
      .where({
        url: slimUrl || null,
      })
      .first();

    res.status(200).send({ available: !board });
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

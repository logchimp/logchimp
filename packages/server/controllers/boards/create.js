// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const { generateHexColor } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.create = async (req, res) => {
  const permissions = req.user.permissions;
  const name = req.body.name || "new board";
  const display = req.body.display;

  const checkPermission = permissions.includes("board:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const createBoard = await database
      .insert({
        boardId: uuidv4(),
        name,
        url: `new-board-${nanoid(10)}`,
        color: generateHexColor(),
        display,
      })
      .into("boards")
      .returning("*");

    const board = createBoard[0];

    res.status(201).send({ board });
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

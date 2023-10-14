// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const { generateHexColor } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const permissions = req.user.permissions;

  const checkPermission = permissions.includes("roadmap:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    // get maximum index value of roadmap
    const roadmapIndex = await database.max("index").from("roadmaps").first();

    const createRoadmap = await database
      .insert({
        id: uuidv4(),
        name: "new roadmap",
        url: `new-roadmap-${nanoid(10)}`,
        color: generateHexColor(),
        index: roadmapIndex.max + 1,
      })
      .into("roadmaps")
      .returning("*");

    const roadmap = createRoadmap[0];

    res.status(201).send({ roadmap });
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

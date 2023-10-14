// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const userId = req.user.userId;
  const name = req.body.name;

  if (name?.length >= 30) {
    res.status(400).send({
      name: "Name cannot execed 30 characters",
      code: "NAME_LENGTH",
    });
    return;
  }

  try {
    const users = await database
      .update({
        name,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
      .where({
        userId,
      })
      .returning(["userId", "name", "username", "email"]);

    const user = users[0];

    res.status(200).send({ user });
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

const database = require("../database");

// utils
const { validEmail } = require("../helpers");
const logger = require("../utils/logger");
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
  const email =
    (req.body ? req.body.email : "") || (req.user ? req.user.email : "");

  if (!validEmail(email)) {
    return res.status(400).send({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
  }

  try {
    const user = await database
      .select()
      .from("users")
      .where({
        email,
      })
      .first();

    if (!user) {
      return res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
    }

    req.user = user;
    next();
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

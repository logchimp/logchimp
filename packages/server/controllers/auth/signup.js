// services
const createUser = require("../../services/auth/createUser");

const database = require("../../database");

// utils
const { validEmail } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.signup = async (req, res, next) => {
  const { email, password } = req.body;

  if (!validEmail(email)) {
    return res.status(400).send({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
  }

  if (!password) {
    return res.status(400).send({
      message: error.api.authentication.noPasswordProvided,
      code: "PASSWORD_MISSING",
    });
  }

  try {
    const settings = await database.select().from("settings").first();

    if (!settings.allowSignup) {
      return res.status(400).send({
        message: error.api.roles.notEnoughPermission,
        code: "SIGNUP_NOT_ALLOWED",
      });
    }

    const user = await createUser(req, res, next, {
      email,
      password,
    });

    res.status(201).send({ user });
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

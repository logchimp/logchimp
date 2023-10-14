// database
const database = require("../../database");

// services
const createUser = require("../../services/auth/createUser");

// utils
const { validEmail } = require("../../helpers");
const error = require("../../errorResponse.json");
const logger = require("../../utils/logger");

module.exports = async (req, res, next) => {
  const { siteTitle, name, email, password } = req.body;

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
    const isSetup = await database
      .select()
      .from("users")
      .where({
        isOwner: true,
      })
      .first();

    if (isSetup) {
      return res.status(403).send({
        message: error.api.authentication.setupAlreadyCompleted,
        code: "SETUP_COMPLETED",
      });
    }

    const user = await createUser(req, res, next, {
      email,
      password,
      name,
    });

    // set user as owner
    await database
      .update({
        isOwner: true,
      })
      .from("users")
      .where({
        userId: user.userId,
      });

    await database
      .update({
        title: siteTitle,
      })
      .from("settings");

    res.status(201).send({ user });
  } catch (error) {
    logger.log({
      level: "error",
      message: error,
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

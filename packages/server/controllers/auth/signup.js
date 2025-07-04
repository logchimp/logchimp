import { blacklistedDomains } from "./blacklist.js";



// services
const createUser = require("../../services/auth/createUser");

const database = require("../../database");

// utils
const { validEmail } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

//function to check if the email domain is blacklisted
const isDomainBlacklisted = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return blacklistedDomains.includes(domain);
};

exports.signup = async (req, res, next) => {
  const { email, password } = req.body;

  if (!validEmail(email)) {
    return res.status(400).send({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
  }
 //  Domain blacklist check
  if (isDomainBlacklisted(email)) {
    return res.status(400).send({
      message: "Email domain is not allowed for signup.",
      code: "EMAIL_DOMAIN_BLACKLISTED",
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

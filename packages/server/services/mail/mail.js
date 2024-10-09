const nodemailer = require("nodemailer");
require("dotenv").config();

// utils
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();
const logger = require("../../utils/logger");

function getMailConfig() {
  const mailConfig = {
    host: process.env.LOGCHIMP_MAIL_HOST || config.mail?.host,
    port: process.env.LOGCHIMP_MAIL_PORT || config.mail?.port,
    secure: false,
    ignoreTLS: process.env.NODE_ENV === "development",
    auth: {
      user: process.env.LOGCHIMP_MAIL_USER || config.mail?.user,
      pass: process.env.LOGCHIMP_MAIL_PASSWORD || config.mail?.password,
    },
  };

  const isConfigured = Object.values(mailConfig).some(
    (value) => value !== undefined,
  );

  if (!isConfigured) {
    logger.warn("Email adapter missing");
    return null;
  }

  return nodemailer.createTransport(mailConfig);
}

module.exports = getMailConfig();

const nodemailer = require("nodemailer");
require("dotenv").config();

// utils
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();
const logger = require("../../utils/logger");

if (config.mail) {
  const mail = nodemailer.createTransport({
    host: process.env.LOGCHIMP_MAIL_HOST || config.mail?.host,
    port: process.env.LOGCHIMP_MAIL_PORT || config.mail?.port,
    secure: false,
    ignoreTLS: process.env.NODE_ENV === "development",
    auth: {
      user: process.env.LOGCHIMP_MAIL_USER || config.mail?.user,
      pass: process.env.LOGCHIMP_MAIL_PASSWORD || config.mail?.password,
    },
  });

  module.exports = mail;
} else {
  logger.warn("Email adapter missing");
  module.exports = null;
}

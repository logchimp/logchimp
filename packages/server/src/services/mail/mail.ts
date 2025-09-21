import nodemailer from "nodemailer";
import("dotenv");

// utils
import { configManager } from "../../utils/logchimpConfig";
const config = configManager.getConfig();
import logger from "../../utils/logger";

function getMailConfig() {
  const mailConfig = {
    host: config.mailHost,
    port: config.mailPort,
    secure: config.mailPort === 465,
    auth: {
      user: config.mailUser,
      pass: config.mailPassword,
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

export const mail = getMailConfig();

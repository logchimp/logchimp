import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import logger from "./logger";

function config() {
  // read logchimp.config.json from file-system
  const configPath = path.resolve(
    __dirname,
    "../../../../logchimp.config.json",
  );
  const isConfigExists = fs.existsSync(configPath);

  if (isConfigExists) {
    const config = fsExtra.readJsonSync(
      path.resolve(__dirname, "../../../../logchimp.config.json"),
    );

    if (config.mail.service) {
      logger.info(
        "'mail.service' key is deprecated and will be removed in next major release in `logchimp.config.json`.",
      );
    }

    return config;
  }

  const themeStandalone = process.env.LOGCHIMP_THEME_STANDALONE; // deprecated
  const serverPort = process.env.LOGCHIMP_SERVER_PORT || process.env.PORT;
  const serverSecretKey = process.env.LOGCHIMP_SECRET_KEY;
  const machineSignature = process.env.LOGCHIMP_MACHINE_SIGNATURE;
  const isSelfHosted = process.env.LOGCHIMP_IS_SELF_HOSTED === "true";
  const webUrl = process.env.LOGCHIMP_WEB_URL;

  // Database
  const databaseHost = process.env.LOGCHIMP_DB_HOST;
  const databaseUser = process.env.LOGCHIMP_DB_USER;
  const databasePassword = process.env.LOGCHIMP_DB_PASSWORD;
  const databasePort = process.env.LOGCHIMP_DB_PORT;
  const databaseName = process.env.LOGCHIMP_DB_DATABASE;
  const databaseSsl = process.env.LOGCHIMP_DB_SSL;

  // Cache
  const cacheUrl = process.env.LOGCHIMP_VALKEY_URL;

  // Mail
  const mailService = process.env.LOGCHIMP_MAIL_SERVICE; // deprecated
  const mailHost = process.env.LOGCHIMP_MAIL_HOST;
  const mailUser = process.env.LOGCHIMP_MAIL_USER;
  const mailPassword = process.env.LOGCHIMP_MAIL_PASSWORD;
  const mailPort = process.env.LOGCHIMP_MAIL_PORT;

  if (process.env?.LOGCHIMP_MAIL_SERVICE) {
    logger.info(
      "'LOGCHIMP_MAIL_SERVICE' variable is deprecated and will be removed in next major release.",
    );
  }

  if (process.env?.LOGCHIMP_THEME_STANDALONE) {
    logger.info(
      "'LOGCHIMP_THEME_STANDALONE' variable is deprecated and will be removed in next major release.",
    );
  }

  if (!webUrl?.trim()) {
    logger.info(
      "'LOGCHIMP_WEB_URL' variable is missing, some functionality of the LogChimp may not work as intended.",
    );
  }

  return {
    theme: {
      standalone: themeStandalone === "true",
    },
    server: {
      machineSignature,
      isSelfHosted,
      port: serverPort,
      secretKey: serverSecretKey,
      webUrl,
    },
    database: {
      host: databaseHost,
      user: databaseUser,
      password: databasePassword,
      name: databaseName,
      port: databasePort,
      ssl: databaseSsl === "true",
    },
    cache: {
      url: cacheUrl,
    },
    mail: {
      service: mailService,
      host: mailHost,
      user: mailUser,
      password: mailPassword,
      port: mailPort,
    },
  };
}

export default config;

const path = require("path");
const fs = require("fs-extra");
const logger = require("./logger");

const config = () => {
  // read logchimp.config.json from file-system
  const configPath = path.resolve(__dirname, "../../../logchimp.config.json");
  const isConfigExists = fs.existsSync(configPath);

  if (isConfigExists) {
    const config = fs.readJsonSync(
      path.resolve(__dirname, "../../../logchimp.config.json"),
    );

    return config;
  }

  // read environment variables
  const logchimpEnv = process.env.LOGCHIMP;
  // LOGCHIMP_THEME_STANDALONE is in BETA
  const themeStandalone = process.env.LOGCHIMP_THEME_STANDALONE;
  const serverPort = process.env.LOGCHIMP_SERVER_PORT || process.env.PORT;
  const serverSecretKey = process.env.LOGCHIMP_SECRET_KEY;
  const databaseHost = process.env.LOGCHIMP_DB_HOST;
  const databaseUser = process.env.LOGCHIMP_DB_USER;
  const databasePassword = process.env.LOGCHIMP_DB_PASSWORD;
  const databasePort = process.env.LOGCHIMP_DB_PORT;
  const databaseName = process.env.LOGCHIMP_DB_DATABASE;
  const databaseSsl = process.env.LOGCHIMP_DB_SSL;
  const mailService = process.env.LOGCHIMP_MAIL_SERVICE;
  const mailHost = process.env.LOGCHIMP_MAIL_HOST;
  const mailUser = process.env.LOGCHIMP_MAIL_USER;
  const mailPassword = process.env.LOGCHIMP_MAIL_PASSWORD;
  const mailPort = process.env.LOGCHIMP_MAIL_PORT;

  if (logchimpEnv === "1") {
    return {
      theme: {
        standalone: themeStandalone === "true" ? true : false,
      },
      server: {
        port: serverPort,
        secretKey: serverSecretKey,
      },
      database: {
        host: databaseHost,
        user: databaseUser,
        password: databasePassword,
        name: databaseName,
        port: databasePort,
        ssl: databaseSsl === "true" ? true : false,
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

  logger.info("LogChimp configuration missing");
};

module.exports = config;

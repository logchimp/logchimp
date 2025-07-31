import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";

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
      console.log(
        "'mail.service' key is deprecated and will be removed in next major release in `logchimp.config.json`.",
      );
    }

    return config;
  }

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

  if (process.env.LOGCHIMP_MAIL_SERVICE) {
    console.log(
      "'LOGCHIMP_MAIL_SERVICE' variable is deprecated and will be removed in next major release.",
    );
  }

  return {
    theme: {
      standalone: themeStandalone === "true",
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
      ssl: databaseSsl === "true",
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

import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import logger from "./logger";

const DEFAULT_SERVER_PORT = 8000;
const DEFAULT_DATABASE_PORT = 5432;
const DEFAULT_MAIL_PORT = 465;

interface Config {
  secretKey: string | undefined;
  machineSignature: string | undefined;
  isSelfHosted: boolean | undefined;

  // Server
  serverHost: string | undefined;
  serverPort: number | undefined;
  webUrl: string | undefined;

  // Database
  databaseHost: string | undefined;
  databaseUser: string | undefined;
  databasePort: number;
  databasePassword: string | undefined;
  databaseName: string | undefined;
  databaseSsl: boolean;

  // Cache
  cacheUrl: string | undefined;

  // Mail
  mailHost: string | undefined;
  mailUser: string | undefined;
  mailPassword: string | undefined;
  mailPort: number;
}

class ConfigManager {
  private readonly configPath: string;
  private cachedConfig: Config;

  constructor(configPath?: string) {
    this.configPath =
      configPath || path.resolve(__dirname, "../../../../logchimp.config.json");
  }

  /**
   * Get the complete configuration, with caching
   */
  public getConfig(): Config {
    if (!this.cachedConfig) {
      this.cachedConfig = this.loadAndMergeConfig();
    }
    return this.cachedConfig;
  }

  public reload() {
    this.cachedConfig = this.loadAndMergeConfig();
    return this.cachedConfig;
  }

  private loadAndMergeConfig(): Config {
    const fileConfig = this.getConfigFile();
    const envConfig = this.getEnvConfig();
    const config = this.mergeConfigs(fileConfig, envConfig);

    if (!config.webUrl?.trim()) {
      logger.warn(
        "'LOGCHIMP_WEB_URL' variable is missing, some functionality of the LogChimp may not work as intended.",
      );
    }

    logger.warn(
      "LogChimp mail configuration default port '465' will be removed in next major release. It means you've to explicitly provide the SMTP mail port.",
    );

    return config;
  }

  /**
   * Check if config file exists
   */
  public hasConfigFile(): boolean {
    return fs.existsSync(this.configPath);
  }

  // Read config from `logchimp.config.json` file
  private getConfigFile(): Config | null {
    if (!this.hasConfigFile()) return null;

    const config = fsExtra.readJsonSync(this.configPath);

    if (config?.mail?.service) {
      logger.info(
        "'mail.service' key is deprecated and will be removed in next major release in `logchimp.config.json`.",
      );
    }

    if (config?.theme?.standalone) {
      logger.info(
        "'theme.standalone' key is deprecated and will be removed in next major release in `logchimp.config.json`.",
      );
    }

    const serverPort = config.server?.port;
    const mailPort = config.mail?.port;

    return {
      secretKey: config.server?.secretKey,
      machineSignature: config.server?.machineSignature,
      isSelfHosted:
        config.server?.selfHosted === true ||
        config.server?.selfHosted === "true",

      // Server
      serverHost: config.server?.host,
      serverPort: serverPort
        ? Number.parseInt(`${config.server?.port}`, 10)
        : DEFAULT_SERVER_PORT,
      webUrl: config.server?.webUrl,

      // Database
      databaseHost: config.database?.host,
      databaseUser: config.database?.user,
      databasePassword: config.database?.password,
      databasePort: config.database?.port,
      databaseName: config.database?.name,
      databaseSsl:
        config.database?.ssl === "true" ||
        config.database?.ssl === true ||
        false,

      // Cache
      cacheUrl: config.cache?.url,

      // Mail
      mailHost: config.mail?.host,
      mailUser: config.mail?.user,
      mailPassword: config.mail?.password,
      mailPort: mailPort ? Number.parseInt(mailPort, 10) : 465,
    };
  }

  private getEnvConfig(): Config {
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

    const serverPort = process.env.LOGCHIMP_SERVER_PORT || process.env.PORT;
    const databasePort = process.env.LOGCHIMP_DB_PORT;
    const mailPort = process.env.LOGCHIMP_MAIL_PORT;

    return {
      secretKey: process.env.LOGCHIMP_SECRET_KEY,
      machineSignature: process.env.LOGCHIMP_MACHINE_SIGNATURE,
      isSelfHosted: process.env.LOGCHIMP_IS_SELF_HOSTED === "true",

      // Server
      serverHost: process.env.LOGCHIMP_API_HOST,
      serverPort: serverPort
        ? Number.parseInt(`${serverPort}`, 10)
        : DEFAULT_SERVER_PORT,
      webUrl: process.env.LOGCHIMP_WEB_URL,

      // Database
      databaseHost: process.env.LOGCHIMP_DB_HOST,
      databaseUser: process.env.LOGCHIMP_DB_USER,
      databasePassword: process.env.LOGCHIMP_DB_PASSWORD,
      databasePort: databasePort
        ? Number.parseInt(databasePort, 10)
        : DEFAULT_DATABASE_PORT,
      databaseName: process.env.LOGCHIMP_DB_DATABASE,
      databaseSsl: process.env.LOGCHIMP_DB_SSL === "true",

      // Cache
      cacheUrl: process.env.LOGCHIMP_VALKEY_URL,

      // Mail
      mailHost: process.env.LOGCHIMP_MAIL_HOST,
      mailUser: process.env.LOGCHIMP_MAIL_USER,
      mailPassword: process.env.LOGCHIMP_MAIL_PASSWORD,
      mailPort: mailPort ? Number.parseInt(mailPort, 10) : DEFAULT_MAIL_PORT,
    };
  }

  private mergeConfigs(fileConfig: Config | null, envConfig: Config) {
    return {
      ...envConfig,
      ...(fileConfig || {}),
    };
  }
}

export const configManager = new ConfigManager();

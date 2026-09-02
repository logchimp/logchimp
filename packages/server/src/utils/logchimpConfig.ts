import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import logger from "./logger";
import packageJson from "../../package.json";
import { isDevTestEnv } from "../helpers";

const DEFAULT_SERVER_PORT = 8000;
const DEFAULT_DATABASE_PORT = 5432;
const DEFAULT_MAIL_PORT = 465;

interface Config {
  version: string;

  secretKey: string | undefined;
  machineSignature: string | undefined;
  isSelfHosted: boolean | undefined;

  // Server
  apiUrl: string | undefined;
  serverHost: string | undefined;
  serverPort: number | undefined;
  webUrl: string | undefined;

  // License
  licenseKey: string | undefined;
  licenseSignature: string | undefined;
  licensePilotUrl: string | undefined;

  // Database
  databaseUrl: string | undefined;
  databaseHost: string | undefined;
  databaseUser: string | undefined;
  databasePort: number;
  databasePassword: string | undefined;
  databaseName: string | undefined;
  databaseSsl: boolean;

  // Cache
  cachePrefix: string | undefined;
  cacheUrl: string | undefined;

  // Mail
  mailHost: string | undefined;
  mailUser: string | undefined;
  mailPassword: string | undefined;
  mailPort: number;

  // OIDC
  oidcClientId: string | undefined;
  oidcClientSecret: string | undefined;
  oidcIssuer: string | undefined;
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
    const databasePort = config.database?.port;
    const databaseSsl = config.database?.ssl;

    return {
      secretKey: this.envString(config.server?.secretKey),
      machineSignature: this.envString(config.server?.machineSignature),
      isSelfHosted:
        config.server?.selfHosted === true ||
        this.envString(config.server?.selfHosted) === "true",

      // Server
      apiUrl: this.envString(config.server?.apiUrl),
      serverHost: this.envString(config.server?.host),
      serverPort: serverPort
        ? typeof serverPort === "string"
          ? Number.parseInt(this.envString(serverPort), 10)
          : serverPort
        : DEFAULT_SERVER_PORT,
      webUrl: this.envString(config.server?.webUrl),

      // License
      licenseKey: this.envString(config?.license?.key),
      licenseSignature: this.envString(config?.license?.signature),
      licensePilotUrl: this.envString(config?.license?.pilotUrl),

      // Database
      databaseUrl: this.envString(config.database?.url),
      databaseHost: this.envString(config.database?.host),
      databaseUser: this.envString(config.database?.user),
      databasePassword: this.envString(config.database?.password),
      databasePort: databasePort
        ? typeof databasePort === "string"
          ? Number.parseInt(this.envString(databasePort), 10)
          : databasePort
        : DEFAULT_DATABASE_PORT,
      databaseName: this.envString(config.database?.name),
      databaseSsl:
        typeof databaseSsl === "string"
          ? this.envString(databaseSsl) === "true"
          : databaseSsl === true,

      // Cache
      cachePrefix: this.envString(config?.cache?.prefix),
      cacheUrl: this.envString(config.cache?.url),

      // Mail
      mailHost: this.envString(config.mail?.host),
      mailUser: this.envString(config.mail?.user),
      mailPassword: this.envString(config.mail?.password),
      mailPort: mailPort
        ? typeof mailPort === "string"
          ? Number.parseInt(this.envString(mailPort), 10)
          : mailPort
        : 465,

      // OIDC
      oidcClientId: this.envString(config.oidc?.clientId),
      oidcClientSecret: this.envString(config.oidc?.clientSecret),
      oidcIssuer: this.envString(config.oidc?.issuer),

      version: this.envString(""),
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
    const databaseSsl = process.env.LOGCHIMP_DB_SSL;
    const mailPort = process.env.LOGCHIMP_MAIL_PORT;

    return {
      secretKey: this.envString(process.env.LOGCHIMP_SECRET_KEY),
      machineSignature: this.envString(process.env.LOGCHIMP_MACHINE_SIGNATURE),
      isSelfHosted: process.env.LOGCHIMP_IS_SELF_HOSTED === "true",

      // Server
      apiUrl: this.envString(process.env.LOGCHIMP_API_URL),
      serverHost: this.envString(process.env.LOGCHIMP_API_HOST),
      serverPort: serverPort
        ? typeof serverPort === "string"
          ? Number.parseInt(this.envString(serverPort), 10)
          : serverPort
        : DEFAULT_SERVER_PORT,
      webUrl: this.envString(process.env.LOGCHIMP_WEB_URL),

      // License
      licenseKey: this.envString(process.env.LOGCHIMP_LICENSE_KEY),
      licenseSignature: this.envString(process.env.LOGCHIMP_SIGNATURE_TOKEN),
      licensePilotUrl: this.envString(process.env.LOGCHIMP_PILOT_URL),

      // Database
      databaseUrl: this.envString(process.env.LOGCHIMP_DB_URL),
      databaseHost: this.envString(process.env.LOGCHIMP_DB_HOST),
      databaseUser: this.envString(process.env.LOGCHIMP_DB_USER),
      databasePassword: this.envString(process.env.LOGCHIMP_DB_PASSWORD),
      databasePort: databasePort
        ? typeof databasePort === "string"
          ? Number.parseInt(this.envString(databasePort), 10)
          : databasePort
        : DEFAULT_DATABASE_PORT,
      databaseName: this.envString(process.env.LOGCHIMP_DB_DATABASE),
      databaseSsl:
        typeof databaseSsl === "string"
          ? this.envString(databaseSsl) === "true"
          : databaseSsl,

      // Cache
      cachePrefix: this.envString(process.env.LOGCHIMP_CACHE_PREFIX),
      cacheUrl: this.envString(process.env.LOGCHIMP_VALKEY_URL),

      // Mail
      mailHost: this.envString(process.env.LOGCHIMP_MAIL_HOST),
      mailUser: this.envString(process.env.LOGCHIMP_MAIL_USER),
      mailPassword: this.envString(process.env.LOGCHIMP_MAIL_PASSWORD),
      mailPort: mailPort
        ? typeof mailPort === "string"
          ? Number.parseInt(this.envString(mailPort), 10)
          : mailPort
        : DEFAULT_MAIL_PORT,

      // OIDC
      oidcClientId: this.envString(process.env.LOGCHIMP_OIDC_CLIENT_ID),
      oidcClientSecret: this.envString(process.env.LOGCHIMP_OIDC_CLIENT_SECRET),
      oidcIssuer: this.envString(process.env.LOGCHIMP_OIDC_ISSUER),

      version: this.envString(""),
    };
  }

  private mergeConfigs(fileConfig: Config | null, envConfig: Config) {
    if (!isDevTestEnv) {
      if (envConfig?.licenseKey) {
        envConfig.licensePilotUrl = undefined;
      }
      if (fileConfig?.licensePilotUrl) {
        fileConfig.licensePilotUrl = undefined;
      }
    }

    return {
      ...envConfig,
      ...(fileConfig || {}),
      version: packageJson.version,
    };
  }

  private envString(key?: string, fallback?: string) {
    if (key === undefined) {
      if (fallback === "") {
        return fallback;
      }
      if (fallback) return fallback;
      return undefined;
    }

    return (key || "").trim();
  }

  // private getEnv = <K extends keyof NodeJS.ProcessEnv>(key: K, fallback?: NodeJS.ProcessEnv[K]): NodeJS.ProcessEnv[K] => {
  //   const value = process.env[key] as NodeJS.ProcessEnv[K] | undefined;
  //
  //   if (value === undefined) {
  //     // handle fallback falsy cases that should still be used as value
  //     if (fallback === false || fallback === "" || fallback === 0) {
  //       return fallback;
  //     }
  //     if (fallback) {
  //       return fallback;
  //     }
  //     throw new Error(`Missing environment variable: ${key}.`);
  //   }
  //
  //   return value;
  // };
}

export const configManager = new ConfigManager();
export const config = configManager.getConfig();

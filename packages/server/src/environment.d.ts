declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "production" | "staging" | "ci" | "testing" | "development";
    readonly PORT: string | undefined;
    readonly LOGCHIMP_IS_SELF_HOSTED: string | undefined;
    // readonly ORIGIN: string | undefined;

    readonly LOGCHIMP_SECRET_KEY: string | undefined;
    readonly LOGCHIMP_MACHINE_SIGNATURE: string | undefined;

    // Server
    readonly LOGCHIMP_API_HOST: string | undefined;
    readonly LOGCHIMP_SERVER_PORT: string | undefined;
    readonly LOGCHIMP_WEB_URL: string | undefined;

    // Database
    readonly LOGCHIMP_DB_SSL: string | undefined;
    readonly LOGCHIMP_DB_HOST: string | undefined;
    readonly LOGCHIMP_DB_USER: string | undefined;
    readonly LOGCHIMP_DB_PASSWORD: string | undefined;
    readonly LOGCHIMP_DB_DATABASE: string | undefined;
    readonly LOGCHIMP_DB_PORT: string | undefined;

    // Cache
    readonly LOGCHIMP_VALKEY_URL: string | undefined;

    // SMTP - Mail Configuration
    /**
     * @deprecated
     */
    readonly LOGCHIMP_MAIL_SERVICE: string | undefined;
    readonly LOGCHIMP_MAIL_HOST: string | undefined;
    readonly LOGCHIMP_MAIL_USER: string | undefined;
    readonly LOGCHIMP_MAIL_PASSWORD: string | undefined;
    readonly LOGCHIMP_MAIL_PORT: string | undefined;
  }
}

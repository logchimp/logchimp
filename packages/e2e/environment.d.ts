declare namespace NodeJS {
  interface ProcessEnv {
    readonly BASE_URL: string | undefined;
    readonly CI_BRANCH_NAME: string | undefined;
  }
}

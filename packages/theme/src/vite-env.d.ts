/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // TODO: Add TS types
  // biome-ignore lint: Add TS types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface RuntimeEnv {
  readonly VITE_API_URL: string;
  readonly VITE_IS_SELF_HOSTED: string | undefined;
  readonly VITE_LOGCHIMP_VERSION: string | undefined;
  readonly VITE_SHOW_TELEMETRY_FORM: string | undefined;
  readonly VITE_SHOW_LANGUAGE_DROPDOWN: string | undefined;
}

interface Window {
  __APP_ENV__: Partial<RuntimeEnv>;
}

interface ImportMetaEnv extends RuntimeEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

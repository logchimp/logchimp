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
}

interface Window {
  __APP_ENV__: Partial<RuntimeEnv>;
}

interface ImportMetaEnv extends RuntimeEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

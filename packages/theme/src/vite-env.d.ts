/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // TODO: Add TS types
  // biome-ignore lint: Add TS types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

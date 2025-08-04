export const VITE_API_URL =
  window.__APP_ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL;

export const IS_SELF_HOSTED =
  window.__APP_ENV__?.VITE_IS_SELF_HOSTED === "true" ||
  import.meta.env.VITE_IS_SELF_HOSTED === "true";

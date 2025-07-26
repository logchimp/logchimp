import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Vite server config should only work in DEV mode
  const apiUrl = env.VITE_API_URL_PROXY || env.VITE_API_URL;

  return {
    plugins: [vue()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: apiUrl,
        },
      },
    },
    build: {
      outDir: "./dist",
    },
  };
});

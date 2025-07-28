import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;

  return {
    plugins: [vue(), tailwind()],
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

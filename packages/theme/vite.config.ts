import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.VITE_HOST;

  return {
    plugins: [vue(), tailwind()],
    server: {
      host: host || "localhost",
      port: 3000,
      allowedHosts: ["logchimp.dev"],
    },
    build: {
      outDir: "./dist",
    },
  };
});

import { defineConfig } from "@maizzle/framework";

export default defineConfig({
  content: ["./templates/**/*.vue"],
  output: {
    path: "dist",
  },
  css: {
    inline: true,
    purge: true,
  },
});

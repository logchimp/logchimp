import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default defineConfigWithVueTs(
  {
    name: "logchimp/theme/files-to-lint",
    files: ["src/**/*.vue"],
  },
  {
    name: "logchimp/theme/files-to-ignore",
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    name: "logchimp/theme/language-options",
    files: ["src/**/*.vue"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    name: "logchimp/theme/rules",
    files: ["src/**/*.vue"],
    rules: {
      // Pre-existing violations surfaced when ESLint took over .vue linting
      // from Biome. Kept as warnings so they can be addressed incrementally
      // without blocking CI.
      "vue/multi-word-component-names": "warn",
      "vue/no-dupe-keys": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  skipFormatting,
);

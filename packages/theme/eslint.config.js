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
  skipFormatting,
);

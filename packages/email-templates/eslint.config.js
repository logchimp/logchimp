import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default defineConfigWithVueTs(
  {
    name: "logchimp/email-templates/files-to-lint",
    files: ["templates/**/*.vue"],
  },
  {
    name: "logchimp/email-templates/files-to-ignore",
    ignores: [".maizzle/**", "dist/**", "node_modules/**"],
  },
  {
    name: "logchimp/email-templates/language-options",
    files: ["templates/**/*.vue"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    name: "logchimp/email-templates/maizzle",
    files: ["templates/**/*.vue"],
    rules: {
      // Maizzle renders these as HTML elements at build time, not as
      // registered Vue components.
      "vue/no-undef-components": "off",
    },
  },
  skipFormatting,
);

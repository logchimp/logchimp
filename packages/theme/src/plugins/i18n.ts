import { createI18n } from "vue-i18n";
import { watchEffect } from "vue";

//locales
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";

const savedLocale = localStorage.getItem("locale") || "en";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: {
    en,
    fr,
    hi,
  },
});

watchEffect(() => {
  localStorage.setItem("locale", i18n.global.locale.value);
});

export default i18n;

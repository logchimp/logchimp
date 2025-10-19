import { createI18n } from "vue-i18n";

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

export default i18n;

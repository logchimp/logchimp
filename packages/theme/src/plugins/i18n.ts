import { createI18n } from "vue-i18n";
import { watchEffect } from "vue";
import Cookie from "js-cookie";

//locales
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";

const savedLocale = Cookie.get("hl") || "en";

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
  Cookie.set("hl", i18n.global.locale.value);
});

export default i18n;

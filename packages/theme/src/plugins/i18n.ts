import { createI18n, type Locale } from "vue-i18n";
import { nextTick, watchEffect } from "vue";
import Cookie from "js-cookie";

//locales
import en from "../locales/en.json";

const SUPPORTED_LOCALES: Locale[] = ["en", "fr", "hi"];
const savedLocale = Cookie.get("hl") || "en";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: {
    en,
  },
});

watchEffect(() => {
  Cookie.set("hl", i18n.global.locale.value, {
    expires: 365,
  });
});

export async function loadLocaleMessages(locale: string) {
  // @ts-expect-error - find the correct type to fix this TS error
  if (i18n.global.availableLocales.includes(locale)) {
    return;
  }

  const messages = await import(`../locales/${locale}.json`);

  i18n.global.setLocaleMessage(locale, messages.default);
  return nextTick();
}

/**
 * Switch language (loads the file first if necessary)
 */
export async function setLocale(locale: string) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`);
    return;
  }

  await loadLocaleMessages(locale);
  // @ts-expect-error - find the correct type to fix this TS error
  i18n.global.locale.value = locale;
  document.documentElement.setAttribute("lang", locale);
}

if (savedLocale !== "en") {
  loadLocaleMessages(savedLocale).then(() => {
    // @ts-expect-error - find the correct type to fix this TS error
    i18n.global.locale.value = savedLocale;
  });
}

export default i18n;

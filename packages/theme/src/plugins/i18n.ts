import { createI18n } from "vue-i18n";
import { nextTick, watchEffect } from "vue";
import Cookie from "js-cookie";

//locales
import en from "../locales/en.json";

const SUPPORTED_LOCALES = ["en", "fr", "hi"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const cookieLocale = Cookie.get("hl");
const savedLocale: SupportedLocale =
  cookieLocale && isSupportedLocale(cookieLocale) ? cookieLocale : "en";

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

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
export async function setLocale(locale: SupportedLocale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`);
    return;
  }

  try {
    await loadLocaleMessages(locale);
    // @ts-expect-error - find the correct type to fix this TS error
    i18n.global.locale.value = locale;
    document.documentElement.setAttribute("lang", locale);
  } catch (error) {
    console.warn(`Could not load locale: ${locale}`, error);

    i18n.global.locale.value = "en";
    document.documentElement.setAttribute("lang", "en");
    Cookie.set("hl", "en");
  }
}

if (savedLocale !== "en") {
  loadLocaleMessages(savedLocale).then(() => {
    // @ts-expect-error - find the correct type to fix this TS error
    i18n.global.locale.value = savedLocale;
  });
}

void setLocale(savedLocale).catch((error) => {
  console.warn(`Could not load locale: ${savedLocale}`, error);
  Cookie.set("hl", "en");
});

export default i18n;

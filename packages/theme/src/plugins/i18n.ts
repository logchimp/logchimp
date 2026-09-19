import { createI18n } from "vue-i18n";
import { nextTick, watchEffect } from "vue";
import Cookie from "js-cookie";
import type { RouteLocationNormalized } from "vue-router";
import deepmerge from "deepmerge";

//locales
import enCommon from "../locales/en/common.json";

const FALLBACK_LOCALE = "en";
const SUPPORTED_LOCALES = ["en", "fr", "hi"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const cookieLocale = Cookie.get("hl");
const savedLocale: SupportedLocale =
  cookieLocale && isSupportedLocale(cookieLocale) ? cookieLocale : "en";

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

// NOTE: This type does not accurately represent the structure of the messages
// this is just a type for the locale files
type Messages = typeof enCommon;

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    en: enCommon as Messages,
  },
});

watchEffect(() => {
  Cookie.set("hl", i18n.global.locale.value, {
    expires: 365,
  });
});

async function loadCeNamespace(
  locale: string,
  namespace: string,
): Promise<Messages> {
  const mod = await import(`../locales/${locale}/${namespace}.json`);
  return mod.default;
}

async function loadEeNamespace(
  locale: string,
  namespace: string,
): Promise<Messages> {
  try {
    const mod = await import(`../ee/locales/${locale}/${namespace}.json`);
    return mod.default;
  } catch {
    return {} as Messages;
  }
}

async function loadAndMergeNamespace(
  locale: string,
  namespace: string,
): Promise<Messages> {
  const ce = await loadCeNamespace(locale, namespace);
  const ee = await loadEeNamespace(locale, namespace);
  return deepmerge(ce, ee);
}

function mergeIntoLocale(locale: string, messages: Messages) {
  const existing = (i18n.global.getLocaleMessage(locale) || {}) as Messages;
  i18n.global.setLocaleMessage(
    locale,
    deepmerge(existing, messages) as Messages,
  );
}

export async function loadLocaleForRoute(
  locale: SupportedLocale,
  path: string,
) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`);
    return;
  }

  const pageNs = path.startsWith("/dashboard") ? "dashboard" : "public";

  // current locale
  const common = await loadAndMergeNamespace(locale, "common");
  const page = await loadAndMergeNamespace(locale, pageNs);
  mergeIntoLocale(locale, deepmerge(common, page));

  // fallback locale
  if (locale !== FALLBACK_LOCALE) {
    const fbCommon = await loadAndMergeNamespace(FALLBACK_LOCALE, "common");
    const fbPage = await loadAndMergeNamespace(FALLBACK_LOCALE, pageNs);
    mergeIntoLocale(FALLBACK_LOCALE, deepmerge(fbCommon, fbPage));
  }

  i18n.global.setLocaleMessage(locale, deepmerge(common, page));

  return nextTick();
}

export async function setLocale(locale: SupportedLocale, currentPath: string) {
  try {
    await loadLocaleForRoute(locale, currentPath);
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
  loadLocaleForRoute(savedLocale, window.location.pathname).then(() => {
    // @ts-expect-error - find the correct type to fix this TS error
    i18n.global.locale.value = savedLocale;
  });
}

export async function onRouteChange(to: RouteLocationNormalized) {
  const locale = i18n.global.locale.value;
  await loadLocaleForRoute(locale, to.path);
}

void setLocale(savedLocale, window.location.pathname).catch((error) => {
  console.warn(`Could not load locale: ${savedLocale}`, error);
  Cookie.set("hl", "en");
});

export default i18n;

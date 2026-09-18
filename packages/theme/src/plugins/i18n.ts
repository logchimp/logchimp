import { createI18n } from "vue-i18n";
import { nextTick, watchEffect } from "vue";
import Cookie from "js-cookie";
import type { RouteLocationNormalized } from "vue-router";

//locales
import enCommon from "../locales/en/common.json";

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
    en: enCommon,
  },
});

watchEffect(() => {
  Cookie.set("hl", i18n.global.locale.value, {
    expires: 365,
  });
});

async function loadCeNamespace(locale: string, namespace: string) {
  const mod = await import(`../locales/${locale}/${namespace}.json`);
  return mod.default;
}

async function loadEeNamespace(locale: string, namespace: string) {
  try {
    const mod = await import(`../ee/locales/${locale}/${namespace}.json`);
    return mod.default;
  } catch {
    return {};
  }
}

async function loadAndMergeNamespace(locale: string, namespace: string) {
  const ce = await loadCeNamespace(locale, namespace);
  const ee = await loadEeNamespace(locale, namespace);

  return { ...ce, ...ee };
}

export async function loadLocaleForRoute(
  locale: SupportedLocale,
  path: string,
) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`);
    return;
  }

  const common = await loadAndMergeNamespace(locale, "common");
  const page = await loadAndMergeNamespace(
    locale,
    path.startsWith("dashboard") ? "dashboard" : "public",
  );

  i18n.global.setLocaleMessage(locale, {
    ...common,
    ...page,
  });

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

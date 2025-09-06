import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";

import App from "./App.vue";
import { router } from "./router";

import "./styles/main.sass";

//locales
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";

const app = createApp(App);
const store = createPinia();
const head = createHead();
const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    fr,
    hi,
  },
});

app.use(router);
app.use(store);
app.use(head);
app.use(i18n);

app.mount("body");

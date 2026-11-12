<template>
  <div class="fixed bottom-6 right-6 z-10 space-y-3">
    <Alert
      v-for="(alert, index) in getAlerts"
      :key="alert.time"
      :title="alert.title"
      :type="alert.type"
      :timeout="alert.timeout"
      :is-toast="true"
      @remove="removeAlert(index)"
    />
  </div>
  <router-view />
</template>

<script setup lang="ts">
// packages
import type { AxiosError } from "axios";
import { computed, onMounted, watch } from "vue";
import type { components } from "@logchimp/api-ts-types";
// import gtag, { setOptions, bootstrap } from "vue-gtag";
import { useHead } from "@unhead/vue";

import packageJson from "../package.json";

import { useSettingStore } from "./store/settings";
import { useUserStore } from "./store/user";
import { useAlertStore } from "./store/alert";
import { MeAPI } from "./modules/me";
import tokenError from "./utils/tokenError";

// components
import { Alert } from "./components/ui/Alert";

const settingsStore = useSettingStore();
const { getAlerts, remove: removeAlert } = useAlertStore();
const userStore = useUserStore();
const meAPI = new MeAPI();

const logchimpVersion = computed(() => packageJson.version);

watch(
  () => settingsStore.get.accentColor,
  () => {
    if (typeof window === "undefined") return;
    const body = document.getElementsByTagName("body")[0];
    if (!body) return;
    if (settingsStore.get.accentColor) {
      body.style.setProperty(
        "--color-brand-color",
        `#${settingsStore.get.accentColor}`,
      );
    }
  },
);

onMounted(async () => {
  await settingsStore.getSiteSettings();

  // set google analytics
  if (settingsStore.get.googleAnalyticsId) {
    // TODO: Properly implement 'vue-gtag' feature
    // setOptions({
    //   config: {
    //     id: settingsStore.get.googleAnalyticsId,
    //   },
    // });
    // bootstrap(gtag).then();
  }

  const user = localStorage.getItem("user");
  if (user) {
    userStore.setUser(JSON.parse(user));

    /**
     * Handling an edge-case when the user not found,
     * and the data still exists on client-side.
     */
    try {
      const permissions = await meAPI.GetPermissions();
      userStore.setPermissions(permissions.permissions);
    } catch (error) {
      const err = error as AxiosError<
        components["schemas"]["GenericAPIErrorResponseBody"]
      >;
      tokenError(err);
    }
  }
});

useHead({
  titleTemplate: (title) =>
    `${title ? `${title} • ` : ""}${settingsStore.get.title}`,
  htmlAttrs: {
    lang: "en",
  },
  meta: [
    {
      name: "generator",
      content: () => `LogChimp v${logchimpVersion.value}`,
    },
    {
      name: "description",
      content: () => `${settingsStore.get.description}. Powered By LogChimp.`,
    },
    {
      name: "robots",
      content: "index, follow",
    },
    // {
    // 	rel: "canonical",
    // 	href: "this.$route.fullPath"
    // },
    {
      name: "language",
      content: "es",
    },
    {
      name: "copyright",
      content: settingsStore.get.title,
    },

    // openGraph
    {
      name: "og:type",
      content: "website",
    },
    {
      name: "og:description",
      content: () => `${settingsStore.get.description}. Powered By LogChimp.`,
    },

    {
      name: "theme-color",
      content: settingsStore.get.accentColor,
    },
    {
      name: "msapplication-TileColor",
      content: settingsStore.get.accentColor,
    },
  ],
  link: [
    {
      rel: "icon",
      type: () => {
        const icon = settingsStore.get.icon || "/logchimp.svg";
        if (icon.endsWith(".svg")) return "image/svg+xml";
        if (icon.endsWith(".png")) return "image/png";
        if (icon.endsWith(".ico")) return "image/x-icon";
        return "image/svg+xml";
      },
      href: () => settingsStore.get.icon || "/logchimp.svg",
    },
  ],
});
</script>

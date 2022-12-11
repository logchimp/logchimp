<template>
  <div
    :style="{
      '--color-brand-color': `#${settingsStore.get.accentColor}`
    }"
  >
    <div class="alerts">
      <Alert
        v-for="(alert, index) in getAlerts"
        :key="alert.time"
        :title="alert.title"
        :type="alert.type"
        :timeout="alert.timeout"
        @remove="removeAlert(index)"
        :is-toast="true"
      />
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
// packages
import axios from "axios";
import { computed, onMounted } from "vue";
import gtag, { setOptions, bootstrap } from "vue-gtag";
import { useHead } from "@vueuse/head";

import packageJson from "../package.json";

import { useSettingStore } from "./store/settings"
import { useUserStore } from "./store/user"
import { useAlertStore } from "./store/alert"
import { getPermissions } from "./modules/users";
import tokenError from "./utils/tokenError";

// components
import { Alert } from "./components/ui/Alert";

const settingsStore = useSettingStore()
const { getAlerts, remove: removeAlert } = useAlertStore()
const userStore = useUserStore()

const logchimpVersion = computed(() => packageJson.version);

function getSiteSettings() {
	axios({
		method: "get",
		url: "/api/v1/settings/site"
	})
		.then(response => {
			settingsStore.update(response.data.settings);
		})
		.catch(error => {
			console.error(error);
		});
}

onMounted(async () => {
	getSiteSettings();

	// set google analytics
	if (settingsStore.get.googleAnalyticsId) {
		setOptions({
			config: {
				id: settingsStore.get.googleAnalyticsId
			}
		});

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
      const permissions = await getPermissions();
      userStore.setPermissions(permissions.data.permissions);
    } catch (error) {
      tokenError(error)
    }
	}
})

useHead({
	titleTemplate: (title) => `${title ? `${title} • ` : ""}${settingsStore.get.title}`,
  htmlAttrs: {
    lang: "en",
  },
	meta: [
		{
			name: "generator",
			content: () => `LogChimp v${logchimpVersion.value}`
		},
		{
			name: "description",
			content: () => `${settingsStore.get.description}. Powered By LogChimp.`
		},
		{
			name: "robots",
			content: "index, follow"
		},
		// {
		// 	rel: "canonical",
		// 	href: "this.$route.fullPath"
		// },
		{
			name: "language",
			content: "es"
		},
		{
			name: "copyright",
			content: settingsStore.get.title
		},

		// openGraph
		{
			name: "og:type",
			content: "website"
		},
		{
			name: "og:description",
			content: () => `${settingsStore.get.description}. Powered By LogChimp.`
		},

    {
      name: "theme-color",
      content: settingsStore.get.accentColor
    },
    {
      name: "msapplication-TileColor",
      content: settingsStore.get.accentColor
    }
	]
})
</script>

<style lang='sass'>
.alerts
	position: fixed
	top: 1.5rem
	right: 1.5rem
	z-index: 10
</style>

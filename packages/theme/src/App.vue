<template>
  <div
    :style="{
      '--brand-color': `#${siteSettings.accentColor}`
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

// components
import Alert from "./components/Alert.vue";

const { get: siteSettings, update: updateSettings } = useSettingStore()
const { getAlerts, remove: removeAlert } = useAlertStore()
const { setUser, setPermissions } = useUserStore()

const logchimpVersion = computed(() => packageJson.version);

function getSiteSettings() {
	axios({
		method: "get",
		url: "/api/v1/settings/site"
	})
		.then(response => {
			updateSettings(response.data.settings);
		})
		.catch(error => {
			console.error(error);
		});
}

onMounted(async () => {
	getSiteSettings();

	// set google analytics
	if (siteSettings.googleAnalyticsId) {
		setOptions({
			config: {
				id: siteSettings.googleAnalyticsId
			}
		});

		// bootstrap(gtag).then();
	}

	const user = localStorage.getItem("user");
	if (user) {
		setUser(JSON.parse(user));
		const permissions = await getPermissions();
		setPermissions(permissions.data);
	}
})

useHead({
	titleTemplate: `%s · ${siteSettings.title}`,
	meta: [
		{
			name: "generator",
			content: `LogChimp v${logchimpVersion}`
		},
		{
			name: "description",
			content: `${siteSettings.description}. Powered By LogChimp.`
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
			content: siteSettings.title
		},

		// openGraph
		{
			name: "og:type",
			content: "website"
		},
		{
			name: "og:description",
			content: `${siteSettings.description}. Powered By LogChimp.`
		}
	]
})
</script>

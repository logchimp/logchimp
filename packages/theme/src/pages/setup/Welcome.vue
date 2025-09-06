<template>
	<div class="onboarding onboarding-content">
		<div class="onboarding-header">
			<h2 class="onboarding-heading">{{t("setupWelcome.heading")}} <span>LogChimp</span>!</h2>
			<p class="onboarding-label">
				{{t("setupWelcome.label")}}
			</p>
		</div>
		<Button type="primary" class="welcome-button" href="/setup/create-account">
			{{t("setupWelcome.cta")}}
		</Button>
		<img
			class="welcome-image"
			src="https://cdn.logchimp.codecarrot.net/logchimp-home-preview.png"
			alt="LogChimp homepage preview"
		/>
	</div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";

import { useSettingStore } from "../../store/settings";

// components
import Button from "../../components/ui/Button.vue";

const { get: siteSettings } = useSettingStore();
const { t } = useI18n();

useHead({
  title: "Welcome • Onboarding",
  meta: [
    {
      name: "og:title",
      content: () => `Welcome • Onboarding • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "SetupWelcome",
});
</script>

<style lang='sass'>
.welcome-image
	width: 100%
	border-radius: var(--border-radius-default)
	border: 1px solid var(--color-gray-90)

.welcome-button
	margin-bottom: 3rem
</style>

<template>
	<div class="onboarding onboarding-content">
		<div class="onboarding-header">
			<h2 class="onboarding-heading">Welcome to <span>LogChimp</span>!</h2>
			<p class="onboarding-label">
				Let’s setup your LogChimp site to track user feedback for building
				better products.
			</p>
		</div>
		<Button type="primary" class="welcome-button" href="/setup/create-account">
			Create an account
		</Button>
		<img
			class="welcome-image"
			src="https://cdn.logchimp.codecarrot.net/logchimp-home-preview.png"
			alt="LogChimp homepage preview"
		/>
	</div>
</template>

<script lang="ts">
export default {
	name: "SetupWelcome"
}
</script>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useHead } from "@vueuse/head";

import { useSettingStore } from "../../store/settings"

// components
import Button from "../../components/ui/Button.vue";

const router = useRouter();
const { get: siteSettings } = useSettingStore()

useHead({
	title: "Welcome • Onboarding",
	meta: [
		{
			name: "og:title",
			content: () => `Welcome • Onboarding • ${siteSettings.title}`
		}
	]
})
</script>

<style lang='sass'>
.welcome-image
	width: 100%
	border-radius: var(--border-radius-default)
	border: 1px solid var(--color-gray-90)

.welcome-button
	margin-bottom: 3rem
</style>

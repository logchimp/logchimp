<template>
  <div class="onboarding onboarding-content">
    <div class="onboarding-header">
      <h2 class="onboarding-heading">
        Welcome to <span>LogChimp</span>!
      </h2>
      <p class="onboarding-label">
        Let’s setup your LogChimp site to track user feedback for building
        better products.
      </p>
    </div>
    <img
      class="welcome-image"
      src="https://cdn.logchimp.codecarrot.net/logchimp-home-preview.png"
      alt="LogChimp homepage preview"
    >
    <Button
      type="primary"
      class="welcome-button"
      @click="createAccount"
    >
      Create an account
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useHead } from "@vueuse/head";

import { useSettingStore } from "../../store/settings"

// components
import Button from "../../components/Button.vue";

const router = useRouter();
function createAccount() {
	router.push("/setup/create-account");
}

const { get: siteSettings } = useSettingStore()

useHead({
	title: "Welcome · Onboarding",
	meta: [
		{
			name: "og:title",
			content: `Welcome · Onboarding · ${siteSettings.title}`
		}
	]
})
</script>

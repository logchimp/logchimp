<script setup lang="ts">
import { onMounted } from "vue";
import { KeyIcon } from "lucide-vue";
import { storeToRefs } from "pinia";

import { useSettingsEEStore } from "../store/settings";
import EmptyScreen from "../../components/EmptyScreen.vue";
import Button from "../../components/ui/Button.vue";
import { DEFAULT_LOGCHIMP_PILOT_URL, IS_DEV } from "../../constants";
import LocalLicenseAlert from "./license/LocalLicenseAlert.vue";

const settingsEEStore = useSettingsEEStore();
const { hasValidLicense, loading } = storeToRefs(settingsEEStore);

onMounted(() => {
  if (IS_DEV && !hasValidLicense.value) {
    console.warn(
      `You're using a feature that requires a valid license. Please enter a license key.`,
    );
  }
});
</script>

<template>
  <div v-if="loading" aria-busy="true">
    <div class="grid gap-y-3" aria-hidden="true">
      <div
        v-for="_ in 4"
        :key="_" class="animate-pulse h-4 bg-neutral-200 rounded-md w-full h-10"
      />
    </div>
  </div>
  <slot v-else-if="hasValidLicense" />
  <div v-else-if="IS_DEV">
    <LocalLicenseAlert class="mb-4" />
    <slot />
  </div>
  <EmptyScreen
    v-else
    :icon="KeyIcon"
    title="This is a commercial feature"
  >
    <template #description>
      You can purchase <strong>LogChimp Self-Managed</strong> commercial license from our official <a href="https://logchimp.app?utm_medium=banner&utm_content=license_required">website</a>.
      If you already have a license key, <a href="https://docs.logchimp.app/self-hosting/license">follow the guide to add it to your LogChimp instance</a>, and if you need any
      further assistance, contact our support team at <a href="mailto:support@logchimp.app">support@logchimp.app</a>.
    </template>

    <template #button>
      <Button type="primary" :href="DEFAULT_LOGCHIMP_PILOT_URL">
        Contact Sales
      </Button>
    </template>
  </EmptyScreen>
</template>

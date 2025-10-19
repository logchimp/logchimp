<script setup lang="ts">
import { onMounted, computed } from "vue";
import { KeyIcon } from "lucide-vue";

import { useSettingStore } from "../../store/settings";
import { Alert } from "../../components/ui/Alert";
import EmptyScreen from "../../components/EmptyScreen.vue";
import Button from "../../components/ui/Button.vue";
import { DEFAULT_LOGCHIMP_PILOT_URL } from "../../constants";

const settingsStore = useSettingStore();
const isDev = computed(() => import.meta.env.DEV);

onMounted(() => {
  if (isDev.value && settingsStore.settings.hasValidLicense === false) {
    console.warn(
      `You're using a feature that requires a valid license. Please enter a license key.`,
    );
  }
});
</script>

<template>
  <slot v-if="settingsStore.settings.hasValidLicense" />
  <div v-else-if="isDev">
    <alert
      title="You can test this feature locally but not on production."
      type="warning"
      class="mb-4"
    >
      <template #description>
        To purchase a commercial license, please reach out to our sales team. If a license key is already in place, please contact logchimp@codecarrot.net for help.
        <a className="underline" :href="DEFAULT_LOGCHIMP_PILOT_URL">
          Contact Sales
        </a>
      </template>
    </alert>
    <slot />
  </div>
  <EmptyScreen
    v-else
    :icon="KeyIcon"
    title="This is a commercial feature"
    description="To purchase a commercial license, please reach out to our sales team. If a license key is already in place, please contact logchimp@codecarrot.net for help."
  >
    <template #button>
      <Button type="primary" :href="DEFAULT_LOGCHIMP_PILOT_URL">
        Contact Sales
      </Button>
    </template>
  </EmptyScreen>
</template>

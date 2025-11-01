<script setup lang="ts">
import { onMounted } from "vue";
import { KeyIcon } from "lucide-vue";

import { useSettingsEEStore } from "../store/settings";
import EmptyScreen from "../../components/EmptyScreen.vue";
import Button from "../../components/ui/Button.vue";
import { DEFAULT_LOGCHIMP_PILOT_URL, IS_DEV } from "../../constants";
import LocalLicenseAlert from "./license/LocalLicenseAlert.vue";

const { hasValidLicense } = useSettingsEEStore();

onMounted(() => {
  if (IS_DEV && !hasValidLicense) {
    console.warn(
      `You're using a feature that requires a valid license. Please enter a license key.`,
    );
  }
});
</script>

<template>
  <slot v-if="hasValidLicense" />
  <div v-else-if="IS_DEV">
    <LocalLicenseAlert class="mb-4" />
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

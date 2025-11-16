import { ref } from "vue";
import { defineStore } from "pinia";
import { useThrottleFn } from "@vueuse/core";

import { SettingsEE } from "../modules/settings";

const settingsEEStore = new SettingsEE();

export const useSettingsEEStore = defineStore("settingsEE", () => {
  const hasValidLicense = ref<boolean>(false);

  const getLicenseInfo = useThrottleFn(async () => {
    try {
      const response = await settingsEEStore.checkLicense();
      hasValidLicense.value = response.status === "active" || false;
    } catch (e) {
      // @ts-expect-error
      const isInvalid = e.response?.data?.code === "LICENSE_VALIDATION_FAILED";
      hasValidLicense.value = !isInvalid;
    }
    // 5 seconds
  }, 5000);

  return {
    getLicenseInfo,
    hasValidLicense,
  };
});

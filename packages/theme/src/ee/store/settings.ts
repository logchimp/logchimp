import { onMounted, ref } from "vue";
import { defineStore } from "pinia";

import { SettingsEE } from "../modules/settings";

const settingsEEStore = new SettingsEE();

export const useSettingsEEStore = defineStore("settingsEE", () => {
  const hasValidLicense = ref<boolean>(false);

  async function getLicenseInfo() {
    try {
      const response = await settingsEEStore.checkLicense();
      hasValidLicense.value = response.status === "active" || false;
    } catch (e) {
      // @ts-expect-error
      const isInvalid = e.response?.data?.code === "LICENSE_VALIDATION_FAILED";
      hasValidLicense.value = !isInvalid;
    }
  }

  onMounted(() => {
    getLicenseInfo();
  });

  return {
    hasValidLicense: hasValidLicense.value,
  };
});

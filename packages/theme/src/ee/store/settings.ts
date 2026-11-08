import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { useThrottleFn } from "@vueuse/core";
import type { components } from "@logchimp/api-ts-types";
import type { AxiosError } from "axios";

import { SettingsEE } from "../modules/settings";

const settingsEEStore = new SettingsEE();

export const useSettingsEEStore = defineStore("settingsEE", () => {
  const loading = ref<boolean>(true);
  const license = reactive<
    components["schemas"]["CheckLicenseControllerResponseBody"]
  >({
    status: "",
    hierarchy: 0,
  });
  const hasValidLicense = ref<boolean>(false);

  const getLicenseInfo = useThrottleFn(async () => {
    try {
      loading.value = true;
      const response = await settingsEEStore.checkLicense();

      if ("status" in response) {
        hasValidLicense.value = response.status === "active";
        Object.assign(license, {
          status: response.status,
          hierarchy: response.hierarchy ?? 0,
        });
      }
    } catch (error) {
      const err = error as AxiosError<
        components["schemas"]["GenericAPIErrorResponseBody"]
      >;

      const isInvalid =
        err.response?.data?.code === "LICENSE_VALIDATION_FAILED";
      hasValidLicense.value = !isInvalid;
    } finally {
      loading.value = false;
    }
    // 5 seconds
  }, 5000);

  return {
    license,
    getLicenseInfo,

    loading,
    hasValidLicense,
  };
});

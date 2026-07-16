import { computed, reactive } from "vue";
import { defineStore } from "pinia";
import type { ISiteSettings } from "@logchimp/types";
import axios from "axios";
import { VITE_API_URL } from "../constants";

export const useSettingStore = defineStore("settings", () => {
  const settings = reactive<ISiteSettings>({
    title: "",
    description: "",
    logo: "",
    icon: "",
    accentColor: "",
    googleAnalyticsId: "",
    isPoweredBy: true,
    allowSignup: true,
    developer_mode: false,
    hasValidLicense: false,

    // experimental features
    labs: {
      voteOnBehalf: false,
    },
  });

  const get = computed(() => settings);
  const labs = computed(() => settings.labs);

  async function getSiteSettings() {
    try {
      const response = await axios({
        method: "get",
        url: `${VITE_API_URL}/api/v1/settings/site`,
      });
      updateSettings(response.data.settings);
    } catch (error) {
      console.error(error);
    }
  }

  function updateSettings(payload: ISiteSettings) {
    Object.assign(settings, payload);
  }

  function updateLabs(payload: Partial<ISiteSettings["labs"]>) {
    Object.assign(settings.labs, payload);
  }

  function updateLogo({ logo }: { logo: string }) {
    settings.logo = logo;
  }

  return {
    // state
    settings,

    // getters
    get,
    labs,

    // actions
    getSiteSettings,
    updateSettings,
    updateLabs,
    updateLogo,
  };
});

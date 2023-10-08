import { computed, reactive } from "vue";
import { defineStore } from "pinia";

export const useSettingStore = defineStore("settings", () => {
  const settings = reactive({
    title: "",
    description: "",
    logo: "",
    icon: "",
    accentColor: "",
    googleAnalyticsId: "",
    isPoweredBy: true,
    allowSignup: true,
    developer_mode: false,

    // experimental features
    labs: {
      comments: false,
    },
  });

  const get = computed(() => settings);
  const labs = computed(() => settings.labs);

  // TODO: Add TS types
  // biome-ignore lint: Add TS types
  function update(payload: any) {
    Object.assign(settings, payload);
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
    update,
    updateLogo,
  };
});

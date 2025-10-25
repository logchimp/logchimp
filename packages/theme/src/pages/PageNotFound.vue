<template>
  <div class="h-screen">
    <div class="p-8 h-full flex flex-col items-center ">
      <site-branding
        :title="siteSettings.title"
        :logo="siteSettings.logo"
      />

      <div class="min-h-0 flex-grow w-full flex items-center justify-center">
        <h1 class="text-4xl font-bold">
          Page not found
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SiteBranding from "../components/site/SiteBranding.vue";
import { useSettingStore } from "../store/settings";

const { get: siteSettings } = useSettingStore();

defineOptions({
  name: "PageNotFound",
});
</script>

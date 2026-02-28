<template>
	<div class="flex justify-center">
    <div class="hover:bg-neutral-200/70 rounded-lg">
      <a
        :href="href"
        class="text-xs font-medium text-(--color-gray-70) px-2 py-0.5"
      >
        Powered by LogChimp
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useSettingStore } from "../store/settings";

const route = useRoute();
const { get: siteSettings } = useSettingStore();

const BASE_URL = "https://logchimp.app";
const href = computed(() => {
  const params = new URLSearchParams({
    utm_medium: "powered",
  });

  const source = route.name?.toString();
  if (source) {
    params.set("utm_source", source);
  }

  if (siteSettings.title) {
    params.set("company", siteSettings.title);
  }

  return `${BASE_URL}?${params}`;
});
</script>

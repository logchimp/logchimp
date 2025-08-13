<template>
  <!-- fixed the logo to the bottom of the page and opacity changes on hover -->
  <div
    class="md:fixed md:bottom-4 md:left-1/2 md:-translate-x-1/2 flex justify-center"
  >
    <div class="rounded-lg opacity-80 hover:opacity-100">
      <a
        :href="`https://logchimp.codecarrot.net/?utm_source=${source}&utm_medium=powered&company=${siteSettings.title}`"
        :class="['text-xs font-medium text-(--color-gray-50)', 'px-2 py-0.5']"
      >
        Powered by <span class="text-[#484D7C]">LogChimp</span>
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

const source = computed(() => route.name?.toString());
</script>

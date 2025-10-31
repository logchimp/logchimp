<script setup lang="ts">
import SiteBranding from "../site/SiteBranding.vue";
import { useSettingStore } from "../../store/settings";

const { get: siteSettings } = useSettingStore();
</script>

<template>
  <div class="flex flex-col items-center mb-8">
    <site-branding
      :title="siteSettings.title"
      :logo="siteSettings.logo"
    />
    <template v-if="$slots.heading">
      <h1 class="text-3xl font-normal text-center mt-4 mb-0">
        <slot name="heading" />
      </h1>
    </template>
  </div>
</template>

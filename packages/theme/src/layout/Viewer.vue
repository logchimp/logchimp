<template>
  <div>
    <Header />
    <div class="w-full max-w-6xl mx-auto px-6 my-8">
      <router-view />

      <div class="mt-8 mb-4 px-3 lg:px-6">
        <PowerBy v-if="settingsStore.get.isPoweredBy" />
        <div class="text-sm text-gray-500 mt-2">
          LogChimp v{{ version }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings";

// components
import Header from "../components/Header.vue";
import PowerBy from "../components/PowerBy.vue";

// Import LogChimp version
import { version } from "../../package.json"; // adjust path if needed

const settingsStore = useSettingStore();
</script>

<template>
  <div>
    <Header />
    <div class="w-full max-w-6xl mx-auto px-6 my-8">
      <router-view />

      <power-by v-if="settingsStore.get.isPoweredBy" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings";

// components
import Header from "../components/Header.vue";
import PowerBy from "../components/PowerBy.vue";

const settingsStore = useSettingStore();
</script>

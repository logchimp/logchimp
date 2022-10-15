<template>
  <div>
    <Header />
    <div class="container container-view">
      <router-view />

			<power-by v-if="settingsStore.get.isPoweredBy" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings"

// components
import Header from "../components/Header.vue";
import PowerBy from "../components/PowerBy.vue";

const settingsStore = useSettingStore()
</script>

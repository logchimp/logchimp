<template>
  <div class="dashboard">
    <aside>
      <Sidebar />
    </aside>
    <main class="container-view">
      <router-view />

      <power-by v-if="siteSettings.isPoweredBy" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings"

// components
import Sidebar from "../components/dashboard/Sidebar.vue";
import PowerBy from "../components/PowerBy.vue";

const { get: siteSettings } = useSettingStore()
</script>

<style lang='scss'>
.dashboard {
  display: flex;
}
</style>

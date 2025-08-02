<template>
  <div class="flex bg-neutral-200">
    <aside class="w-[220px] h-dvh overflow-hidden sticky top-0 bottom-0 overflow-y-auto">
      <Sidebar />
    </aside>
    <main class="md:py-2 md:pr-2 flex-grow">
      <div class="h-full bg-white rounded-xl">
        <router-view />
        <power-by v-if="siteSettings.isPoweredBy" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings";

// components
import Sidebar from "../components/dashboard/Sidebar/Sidebar.vue";
import PowerBy from "../components/PowerBy.vue";

const { get: siteSettings } = useSettingStore();
</script>

<style lang='scss'>
@import "../styles/ui/table.sass";
</style>

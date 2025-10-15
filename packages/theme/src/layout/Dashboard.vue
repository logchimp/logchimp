<template>
  <div class="bg-neutral-200 min-h-screen md:grid md:grid-cols-[min-content_minmax(0,1fr)]">
    <Sidebar />

    <main class="md:py-2 md:pr-2 lg:h-auto md:h-auto h-screen">
      <div class="h-full bg-white md:rounded-xl flex flex-col">
        <router-view />

        <div class="mt-8 mb-4 px-3 lg:px-6">
          <power-by v-if="siteSettings.isPoweredBy" />
        </div>
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

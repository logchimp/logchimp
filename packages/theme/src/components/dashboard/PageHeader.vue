<script setup lang="ts">
import { PanelLeftIcon } from "lucide-vue";

import { useDashboard } from "../../store/dashboard";
const dashboard = useDashboard();

defineOptions({
  name: "DashboardPageHeader",
});
</script>

<template>
  <header
    :class="[
      'flex items-center justify-between mb-6 px-3 lg:px-6 py-3.5',
      'border-b border-b-neutral-300/70'
    ]"
  >
    <div class="flex items-center gap-x-3">
      <!-- Toggle button -->
      <button class="md:hidden p-1.5 cursor-pointer hover:bg-neutral-200 rounded-full" @click="dashboard.toggleSidebar">
        <PanelLeftIcon aria-hidden="true" class="size-5 stroke-neutral-700" />
        <span class="sr-only">open sidebar</span>
      </button>

      <slot name="left" />
    </div>

    <slot />

    <slot name="right" />
  </header>
</template>

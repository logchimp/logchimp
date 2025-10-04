<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { useDashboard } from "../../../store/dashboard";
const dashboard = useDashboard();

const SidebarContent = defineAsyncComponent(
  () => import("./SidebarContent.vue"),
);
import DialogBackdrop from "../../ui/DialogBackdrop.vue";

function away() {
  if (dashboard.isSidebarOpen) {
    dashboard.toggleSidebar();
  }
}
</script>

<template>
  <DialogBackdrop
    :is-visible="dashboard.isSidebarOpen"
    class="md:hidden"
  />
  <div
    :class="[
      'z-50 md:z-auto w-[220px] h-dvh overflow-hidden overflow-y-auto bg-neutral-200',
      'fixed md:sticky left-0 top-0 transition-transform md:translate-x-0',
      dashboard.isSidebarOpen ? '' : '-translate-x-full',
    ]"
    v-on-click-outside="away"
  >
    <SidebarContent />
  </div>
</template>

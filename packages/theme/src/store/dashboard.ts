import { ref } from "vue";
import { defineStore } from "pinia";

export const useDashboard = defineStore("dashboard", () => {
  const isSidebarOpen = ref<boolean>(false);

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  return {
    // sidebar
    isSidebarOpen,
    toggleSidebar,
  };
});

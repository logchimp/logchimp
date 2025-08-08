import { ref } from "vue";
import { defineStore } from "pinia";
import type { IRole } from "@logchimp/types";

import { Roles } from "../../ee/modules/roles";
import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";

const roleServices = new Roles();

export const useDashboardRoles = defineStore("dashboardRoles", () => {
  const roles = ref<IRole[]>([]);
  const state = ref<InfiniteScrollStateType>();
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);

  async function fetchRoles() {
    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await roleServices.getAll();
      roles.value = response.roles;
      state.value = "COMPLETED";
    } catch (err) {
      error.value = err;
      state.value = "ERROR";
    } finally {
      isLoading.value = false;
    }
  }

  return {
    roles,
    state,
    isLoading,
    error,

    fetchRoles,
  };
});

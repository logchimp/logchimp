import { ref } from "vue";
import { defineStore } from "pinia";
import type { IRole } from "@logchimp/types";

import { Roles } from "../../modules/roles";
import type { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";

const roleServices = new Roles();

export const useDashboardRoles = defineStore("dashboardRoles", () => {
  const roles = ref<IRole[]>([]);
  const state = ref<InfiniteScrollStateType>();

  const hasNextPage = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);
  const currentCursor = ref<string>();

  async function fetchRoles() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await roleServices.getAll({
        after: currentCursor.value,
      });

      const results = response.roles;
      const pageInfo = response.page_info;

      if (results.length > 0) {
        roles.value.push(...results);

        currentCursor.value = pageInfo.end_cursor || undefined;
        hasNextPage.value = pageInfo.has_next_page;

        state.value = hasNextPage.value ? "LOADED" : "COMPLETED";
      } else {
        state.value = "COMPLETED";
        hasNextPage.value = false;
      }
    } catch (err) {
      // @ts-expect-error
      error.value = err?.response?.data?.code ?? err;
      state.value = "ERROR";
    } finally {
      isLoading.value = false;
    }
  }

  function appendRole(role: IRole) {
    roles.value.push(role);
  }

  function updateRole(role: IRole) {
    const roleIdx = roles.value.findIndex((item) => item.id === role.id);
    if (roleIdx === -1) return;
    if (!roles.value[roleIdx]) return;

    Object.assign(roles.value[roleIdx], role);
  }

  function removeRole(roleId: string) {
    const roleIdx = roles.value.findIndex((item) => item.id === roleId);
    if (roleIdx === -1) return;

    roles.value.splice(roleIdx, 1);
  }

  return {
    roles,
    state,
    isLoading,
    error,

    fetchRoles,
    appendRole,
    updateRole,
    removeRole,
  };
});

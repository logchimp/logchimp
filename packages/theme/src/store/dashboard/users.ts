import { ref } from "vue";
import { defineStore } from "pinia";
import type { components } from "@logchimp/api-ts-types";

import { UsersAPI } from "../../modules/users";
import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";

const usersServices = new UsersAPI();

export const useDashboardUsers = defineStore("dashboardUsers", () => {
  const users = ref<components["schemas"]["UserItem"][]>([]);
  const state = ref<InfiniteScrollStateType>("IDLE");

  const hasNextPage = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);
  const currentCursor = ref<string | null>(null);

  async function fetchUsers() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await usersServices.GetAll({
        after: currentCursor.value ?? undefined,
      });

      if (response.results.length > 0) {
        users.value.push(...response.results);
      }

      if ("page_info" in response) {
        currentCursor.value = response.page_info.end_cursor;
        hasNextPage.value = response.page_info.has_next_page;
      }

      if (hasNextPage.value) {
        state.value = "LOADED";
      } else {
        state.value = "COMPLETED";
      }
    } catch (err) {
      error.value = err;
      state.value = "ERROR";
    } finally {
      isLoading.value = false;
    }
  }

  function appendUserRole(
    userId: string,
    role: components["schemas"]["UserItemRole"],
  ) {
    const user = getUserById(userId);
    if (!user) return;
    user.roles.push(role);
  }

  function removeUserRole(userId: string, roleId: string) {
    const user = getUserById(userId);
    if (!user) return;

    const userRoleIdx = user.roles.findIndex((item) => item.id === roleId);
    if (userRoleIdx === -1) return;

    user.roles.splice(userRoleIdx, 1);
  }

  function getUserById(userId: string) {
    return users.value.find((item) => item.userId === userId);
  }

  return {
    users,

    isLoading,
    state,
    error,

    fetchUsers,
    getUserById,
    appendUserRole,
    removeUserRole,
  };
});

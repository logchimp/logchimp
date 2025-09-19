import { ref } from "vue";
import { defineStore } from "pinia";
import type { IUser, IUserRole } from "@logchimp/types";

import { Users } from "../../modules/users";
import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";

const usersServices = new Users();

export const useDashboardUsers = defineStore("dashboardUsers", () => {
  const users = ref<IUser[]>([]);
  const state = ref<InfiniteScrollStateType>();

  const hasNextPage = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);
  const currentCursor = ref<string>();

  async function fetchUsers() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await usersServices.getAll({
        after: currentCursor.value,
      });

      const results = response.users;
      const pageInfo = response.page_info;

      if (results.length > 0) {
        users.value.push(...results);

        currentCursor.value = pageInfo?.end_cursor || undefined;
        hasNextPage.value = pageInfo?.has_next_page || false;

        state.value = hasNextPage.value ? "LOADED" : "COMPLETED";
      } else {
        state.value = "COMPLETED";
        hasNextPage.value = false;
      }
    } catch (err) {
      error.value = err;
      state.value = "ERROR";
    } finally {
      isLoading.value = false;
    }
  }

  function appendUserRole(userId: string, role: IUserRole) {
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

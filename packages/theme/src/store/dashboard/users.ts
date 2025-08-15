import { ref } from "vue";
import { defineStore } from "pinia";
import type { IUser } from "@logchimp/types";

import { Users } from "../../modules/users";
import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";

const usersServices = new Users();

export const useDashboardUsers = defineStore("dashboardUsers", () => {
  const users = ref<IUser[]>([]);
  const state = ref<InfiniteScrollStateType>();
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);

  async function fetchUsers() {
    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await usersServices.getAll();
      users.value = response.users;
      state.value = "COMPLETED";
    } catch (err) {
      error.value = err;
      state.value = "ERROR";
    } finally {
      isLoading.value = false;
    }
  }

  function updateUserRole(userId: string, role: IUserRole) {
    const usrIdx = users.value.findIndex((usr) => usr.userId === userId);
    if (usrIdx === -1) return;

    users.value[usrIdx].roles.push(role);
  }

  return {
    users,

    isLoading,
    state,
    error,

    fetchUsers,
    updateUserRole,
  };
});

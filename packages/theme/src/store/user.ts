import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";

import { router } from "../router";
import { PermissionType } from "../modules/users";

export const useUserStore = defineStore("user", () => {
  const authToken = ref<string>("");
  const user = reactive({
    userId: "",
    name: "",
    username: "",
    email: "",
    avatar: "",
  });
  const permissions = ref<string[]>([]);

  const getUser = computed(() => user);
  const getUserId = computed(() => user.userId);

  // TODO: Add TS types
  // biome-ignore lint: Add TS types
  function setUser(payload: any) {
    authToken.value = payload.authToken;
    user.userId = payload.userId;
    user.name = payload.name;
    user.username = payload.username;
    user.email = payload.email;
    user.avatar = payload.avatar;

    localStorage.setItem(
      "user",
      JSON.stringify({
        authToken: authToken.value,
        ...user,
      }),
    );
  }

  function setPermissions(payload: PermissionType) {
    permissions.value = payload;
  }

  // TODO: Add TS types
  // biome-ignore lint: Add TS types
  function login(payload: any) {
    setUser(payload);
  }

  function logout() {
    setUser({});

    setPermissions([]);

    localStorage.removeItem("user");
    if (router.currentRoute.value.fullPath !== "/") {
      router.push("/");
    }
  }

  return {
    // state
    authToken,
    user,
    permissions,

    // getters
    getUser,
    getUserId,

    // actions
    setUser,
    login,
    logout,
    setPermissions,
  };
});

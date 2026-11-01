import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import type { components } from "@logchimp/api-ts-types";

import { router } from "../router";
import Cookie from "js-cookie";

export const useUserStore = defineStore("user", () => {
  const authToken = ref<string>("");
  const user = reactive<
    Pick<
      components["schemas"]["AuthUser"],
      "userId" | "name" | "email" | "username" | "avatar"
    >
  >({
    userId: "",
    name: "",
    username: "",
    email: "",
    avatar: "",
  });
  const permissions = ref<Array<components["schemas"]["Permission"]>>([]);

  const getUser = computed(() => user);
  const getUserId = computed(() => user.userId);

  function setUser(payload: components["schemas"]["AuthUser"]) {
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

  function setAuthToken(token: string) {
    authToken.value = token;

    const getUser = JSON.parse(localStorage.getItem("user") || "{}");

    localStorage.setItem(
      "user",
      JSON.stringify({
        authToken: token,
        ...getUser,
      }),
    );
  }

  function setPermissions(payload: Array<components["schemas"]["Permission"]>) {
    permissions.value = payload;
  }

  function login(payload: components["schemas"]["AuthUser"]) {
    setUser(payload);
  }

  function logout() {
    setUser({
      userId: "",
      avatar: "",
      authToken: "",
      email: "",
      name: "",
      username: "",
    });

    setPermissions([]);

    localStorage.removeItem("user");

    Cookie.remove("lc-auth-token", {
      path: "/oauth/logchimp",
    });

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
    setAuthToken,
    setUser,
    login,
    logout,
    setPermissions,
  };
});

import { useUserStore } from "../store/user";
import { router } from "../router";

// TODO: Add TS types
// biome-ignore lint: Add TS types
const tokenError = (error: any) => {
  const { logout } = useUserStore();

  logout();

  if (error.response.data.code === "USER_NOT_FOUND") {
    if (router.currentRoute.value.fullPath !== "/") {
      router.push("/");
    }
  }

  // invalid token or invalid JWT
  if (["INVALID_TOKEN", "INVALID_JWT"].includes(error.response.data.code)) {
    router.push("/login");
  }

  // invalid auth header format
  if (error.response.data.code === "INVALID_AUTH_HEADER_FORMAT") {
    router.push({
      path: "/login",
      query: {
        redirect: router.currentRoute.value.fullPath,
      },
    });
  }
};

export default tokenError;

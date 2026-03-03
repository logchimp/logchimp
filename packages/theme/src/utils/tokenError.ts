import { useUserStore } from "../store/user";
import { router } from "../router";
import { useLoginRedirectUrl } from "../hooks/useLoginRedirectUrl";

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
  if (error.response.data.code === "INVALID_TOKEN") {
    router.push("/login");
  }

  // invalid auth header format
  if (error.response.data.code === "INVALID_AUTH_HEADER_FORMAT") {
    const loginRedirect = useLoginRedirectUrl();
    router.push(loginRedirect);
  }
};

export default tokenError;

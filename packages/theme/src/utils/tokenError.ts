import type { AxiosError } from "axios";
import type { IApiErrorResponse } from "@logchimp/types";
import { useRouter } from "vue-router";

import { useUserStore } from "../store/user";

export const tokenError = (error: AxiosError<IApiErrorResponse>) => {
  const { logout } = useUserStore();
  const router = useRouter();

  const errorCode = error.response?.data?.code as unknown as string;
  if (!errorCode) return;

  if (
    ["USER_NOT_FOUND", "INVALID_TOKEN", "INVALID_AUTH_HEADER_FORMAT"].includes(
      errorCode,
    )
  ) {
    logout();
  }

  // user not found
  if (errorCode === "USER_NOT_FOUND") {
    if (router.currentRoute.value.fullPath !== "/") {
      router.push("/");
    }
  }

  // invalid token or invalid JWT
  if (errorCode === "INVALID_TOKEN") {
    router.push("/login");
  }

  // invalid auth header format
  if (errorCode === "INVALID_AUTH_HEADER_FORMAT") {
    router.push({
      path: "/login",
      query: {
        redirect: router.currentRoute.value.fullPath,
      },
    });
  }
};

export default tokenError;

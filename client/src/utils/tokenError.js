import store from "../store";
import router from "../routes";

const tokenError = error => {
  store.dispatch("user/logout");

  if (error.response.data.code === "USER_NOT_FOUND") {
    if (router.currentRoute.fullPath !== "/") router.push("/");
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
        redirect: router.currentRoute.fullPath
      }
    });
  }
};

export default tokenError;

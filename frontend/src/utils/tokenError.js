import store from "../store";
import router from "../routes";

const tokenError = error => {
	if (error.response.data.code === "USER_NOT_FOUND") {
		store.dispatch("user/logout");
		if (router.currentRoute.fullPath !== "/") router.push("/");
	}

	// invalid token
	if (error.response.data.code === "INVALID_TOKEN") {
		store.dispatch("user/logout");
		router.push("/login");
	}

	// invalid auth header format
	if (error.response.data.code === "INVALID_AUTH_HEADER_FORMAT") {
		store.dispatch("user/logout");
		router.push({
			path: "/login",
			query: {
				redirect: router.currentRoute.fullPath
			}
		});
	}
};

export default tokenError;

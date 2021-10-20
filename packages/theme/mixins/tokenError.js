export default {
	methods: {
		tokenError(error) {
			this.$store.dispatch("user/logout");

			// remove user from localStorage on client-side
			if (!process.server) {
				localStorage.removeItem("user");
			}

			if (error?.response?.data.code === "USER_NOT_FOUND") {
				if (this.$router.currentRoute.fullPath !== "/") this.$router.push("/");
			}

			// invalid token or invalid JWT
			if (["INVALID_TOKEN", "INVALID_JWT"].includes(error.response.data.code)) {
				this.$router.push("/login");
			}

			// invalid auth header format
			if (error?.response?.data.code === "INVALID_AUTH_HEADER_FORMAT") {
				this.$router.push({
					path: "/login",
					query: {
						redirect: this.$router.currentRoute.fullPath
					}
				});
			}
		}
	}
};

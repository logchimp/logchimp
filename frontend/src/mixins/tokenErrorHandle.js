const tokenErrorHandle = {
	methods: {
		userNotFound(error) {
			if (error.response.data.code === "USER_NOT_FOUND") {
				this.$store.dispatch("user/logout");
				this.$router.push("/");
			}
		},
		invalidToken(error) {
			if (error.response.data.code === "INVALID_TOKEN") {
				this.$store.dispatch("user/logout");
				this.$router.push("/login");
			}
		},
		invalidAuthHeaderFormat(error) {
			if (error.response.data.code === "INVALID_AUTH_HEADER_FORMAT") {
				this.$store.dispatch("user/logout");
				this.$router.push({
					path: "/login",
					query: {
						redirect: this.$route.fullPath
					}
				});
			}
		}
	}
};

export default tokenErrorHandle;

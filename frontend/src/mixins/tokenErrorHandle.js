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
		}
	}
};

export default tokenErrorHandle;

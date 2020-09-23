const userAvatar = {
	computed: {
		userAvatar() {
			const user = this.$store.getters["user/getUser"];
			return user.avatar;
		},
		fullname() {
			const user = this.$store.getters["user/getUser"];
			return `${user.firstname}${user.lastname ? ` ${user.lastname}` : ""}`;
		}
	}
};

export default userAvatar;

<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
export default {
	name: "app",
	created() {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			this.$store.dispatch("user/login", {
				authToken: user.authToken,
				userId: user.userId,
				firstname: user.firstname,
				lastname: user.lastname,
				emailAddress: user.emailAddress,
				username: user.username,
				avatar: user.avatar,
				isVerified: user.isVerified,
				isBlocked: user.isBlocked,
				isModerator: user.isModerator,
				isOwner: user.isOwner,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			});
		}
	}
};
</script>

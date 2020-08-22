<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
export default {
	name: "app",
	mounted() {
		const member = JSON.parse(localStorage.getItem("member"));
		if (member) {
			this.$store.dispatch("member/login", {
				memberId: member.memberId,
				emailAddress: member.emailAddress,
				isVerified: member.isVerified,
				isBlocked: member.isBlocked,
				isModerator: member.isModerator,
				isOwner: member.isOwner,
				createdAt: member.createdAt,
				authToken: member.authToken
			});
		}
	}
};
</script>

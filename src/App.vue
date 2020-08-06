<template>
	<div id="app">
		<Header />
		<div class="container">
			<router-view />
		</div>
	</div>
</template>

<script>
// components
import Header from "./components/layout/Header";

export default {
	name: "app",
	components: {
		Header
	},
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

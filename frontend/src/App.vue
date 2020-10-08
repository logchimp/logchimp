<template>
	<div
		id="app"
		:style="{
			'--brand-color': `#${getSiteSittings.accentColor}`
		}"
	>
		<div class="alerts">
			<Alert
				:key="alert.time"
				v-for="(alert, index) in getAlerts"
				:title="alert.title"
				:type="alert.type"
				:timeout="alert.timeout"
				@remove="removeAlert(index)"
			/>
		</div>
		<router-view />
	</div>
</template>

<script>
import Alert from "./components/Alert";

export default {
	name: "app",
	components: {
		Alert
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		getAlerts() {
			const alerts = this.$store.getters["alerts/getAlerts"];
			return alerts;
		}
	},
	methods: {
		removeAlert(alert) {
			this.$store.dispatch("alerts/remove", alert);
		}
	},
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

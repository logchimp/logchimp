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
// packages
import axios from "axios";

// components
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
		},
		getSiteSettings() {
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/settings/site`
			})
				.then(response => {
					this.$store.dispatch("settings/update", response.data.settings);
				})
				.catch(error => {
					console.error(error);
				});
		}
	},
	created() {
		const settings = localStorage.getItem("settings");

		if (settings) {
			this.$store.dispatch("settings/update", JSON.parse(settings));
		} else {
			this.getSiteSettings();
		}

		const user = localStorage.getItem("user");
		if (user) {
			this.$store.dispatch("user/login", JSON.parse(user));
		}
	}
};
</script>

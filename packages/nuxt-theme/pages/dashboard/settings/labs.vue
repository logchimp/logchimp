<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<a href="/dashboard/settings" class="breadcrum-item">
					Settings
				</a>
				<div class="breadcrum-divider">/</div>
				<h5 class="breadcrum-item">Labs</h5>
			</div>

			<Button
				type="primary"
				:loading="updateSettingsButtonLoading"
				:disabled="updateSettingsPermissionDisabled"
				@click="updateSettings"
			>
				Save
			</Button>
		</header>

		<div class="form-section">
			<p class="form-section-title">Beta features</p>

			<div class="form-columns">
				<div class="form-column">
					<toggle-item
						v-model="labs.comments"
						label="Comments"
						note="Allow users to comment on posts"
					/>
				</div>

				<div class="form-column" />
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// components
import Button from "../../../components/ui/Button.vue";
import ToggleItem from "../../../components/ui/ToggleItem.vue";

export default {
	name: "DashboardSettingsLabs",
	layout: "dashboard",
	components: {
		// components
		Button,
		ToggleItem
	},
	data() {
		return {
			labs: {},
			updateSettingsButtonLoading: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		updateSettingsPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("settings:update");
			return !checkPermission;
		}
	},
	created() {
		this.getSettings();
	},
	methods: {
		async updateSettings() {
			this.updateSettingsButtonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				await this.$axios({
					method: "PATCH",
					url: "/api/v1/settings/labs",
					data: this.labs,
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.$store.dispatch("settings/update", {
					labs: this.labs
				});
				this.updateSettingsButtonLoading = false;
			} catch (error) {
				console.error(error);
				this.updateSettingsButtonLoading = false;
			}
		},
		async getSettings() {
			try {
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/settings/labs"
				});

				this.labs = response.data.labs;
			} catch (error) {
				console.error(error);
			}
		}
	},
	head() {
		return {
			title: `Labs • Settings • Dashboard • ${this.settings.title}`
		};
	}
};
</script>

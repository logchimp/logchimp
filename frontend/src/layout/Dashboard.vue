<template>
	<div class="dashboard">
		<aside>
			<Sidebar />
		</aside>
		<main class="dashboard-main">
			<router-view />
			<power-by v-if="getSiteSittings.isPoweredBy" />
		</main>
	</div>
</template>

<script>
// components
import Sidebar from "../components/dashboard/Sidebar";
import PowerBy from "../components/PowerBy";

export default {
	name: "DashboardLayout",
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	components: {
		Sidebar,
		PowerBy
	}
};
</script>

<template>
	<div class="dashboard">
		<aside>
			<Sidebar />
		</aside>
		<main class="dashboard-main">
			<router-view />
		</main>
	</div>
</template>

<script>
// components
import Sidebar from "../components/dashboard/Sidebar";

export default {
	name: "DashboardLayout",
	components: {
		Sidebar
	}
};
</script>

<style lang="sass">
.dashboard
	display: flex

.dashboard-main
	padding: 3rem
	width: 100%
</style>

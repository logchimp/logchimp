<template>
	<div class="dashboard">
		<aside>
			<Sidebar />
		</aside>
		<main class="dashboard-main">
			<router-view />
			<power-by />
		</main>
	</div>
</template>

<script>
// components
import Sidebar from "../components/dashboard/Sidebar";
import PowerBy from "../components/PowerBy";

export default {
	name: "DashboardLayout",
	components: {
		Sidebar,
		PowerBy
	}
};
</script>

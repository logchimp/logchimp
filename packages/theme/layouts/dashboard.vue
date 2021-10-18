<template>
	<div class="dashboard">
		<aside>
			<Sidebar />
		</aside>
		<main class="container-view">
			<nuxt />
			<power-by />
		</main>
	</div>
</template>

<script>
// components
import Sidebar from "../components/dashboard/Sidebar.vue";
import PowerBy from "../components/PowerBy.vue";

export default {
	name: "DashboardLayout",
	components: {
		Sidebar,
		PowerBy
	},
	async mounted() {
		if (!process.server) {
			const user = localStorage.getItem("user");

			if (user) {
				this.$store.dispatch("user/login", JSON.parse(user));

				const token = this.$store.getters["user/getAuthToken"];
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/users/permissions",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.$store.commit("user/setPermissions", response.data);
			}
		}
	}
};
</script>

<style lang='sass'>
.dashboard
	display: flex
</style>

<template>
	<div>
		<Header />
		<div class="container container-view">
			<Nuxt />
			<power-by />
		</div>
	</div>
</template>

<script>
import Header from "../components/Header.vue";
import PowerBy from "../components/PowerBy.vue";

export default {
	name: "ViewerLayout",
	components: {
		// components
		Header,
		PowerBy
	},
	mounted() {
		if (!process.server) {
			const user = localStorage.getItem("user");

			if (user) {
				this.$store.dispatch("user/login", JSON.parse(user));
				this.$store.dispatch("user/updatePermissions");
			}
		}
	}
};
</script>

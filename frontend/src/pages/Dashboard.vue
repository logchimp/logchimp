<template>
</template>

<script>
export default {
	name: "Dashboard",
	beforeRouteEnter(to, from, next) {
		next(vm => {
			const userId = vm.$store.getters["user/getUserId"];

			if (!userId) {
				vm.$router.push({
					path: "/login",
					query: {
						redirect: "/dashboard"
					}
				});
			}
		});
	}
};
</script>

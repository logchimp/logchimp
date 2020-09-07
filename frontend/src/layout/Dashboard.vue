<template>
	<div class="dashboard">
		<main class="dashboard-main">
			<router-view />
		</main>
	</div>
</template>

<script>
export default {
	name: "DashboardLayout"
};
</script>

<style lang="sass">
.dashboard
	display: flex

.dashboard-main
	padding: 3rem
	width: 100%
</style>

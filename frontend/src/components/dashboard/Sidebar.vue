<template>
	<div class="sidebar">
		<div class="sidebar-header">
			<img src="@/assets/images/logo_invert_color.svg" />
		</div>
		<nav class="sidebar-navbar">
			<router-link to="/dashboard" class="sidebar-navbar-item">
				<div class="navbar-icon">
					<dashboard-icon />
				</div>
				<div class="navbar-content">
					Dashbaord
				</div>
			</router-link>
		</nav>
	</div>
</template>

<script>
// icons
import DashboardIcon from "../../components/icons/Dashboard";

export default {
	name: "DashboardSidebar",
	components: {
		// icons
		DashboardIcon
	}
};
</script>

<style lang="sass" scoped>
.sidebar
	background-color: $brand-color
	height: 100vh
	padding: 1.125rem 1rem
	min-width: 200px

.sidebar-header
	padding-left: 1rem
	padding-right: 1rem
	margin-bottom: 3rem

.sidebar-navbar
	display: flex
	flex-direction: column

.sidebar-navbar-item
	display: flex
	align-items: center
	border-radius: $border-radius
	margin-bottom: 0.625rem
	padding: .625rem 1rem

.sidebar-navbar-item.router-link-exact-active
	background-color: rgba($white, .1)

	.navbar-content
		font-weight: 500

.navbar-icon
	display: flex
	margin-right: 0.5rem

	svg
		stroke: $white
		width: 1rem
		height: 1rem

.navbar-content
	color: $white
</style>

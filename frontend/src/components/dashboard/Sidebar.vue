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
		<footer class="sidebar-footer">
			<div class="sidebar-user-container">
				<div class="sidebar-user">
					<avatar class="sidebar-user-avatar" :name="username" />
					<div class="sidebar-user-data">
						<div class="sidebar-user-name">
							{{ fullname }}
						</div>
						<div class="sidebar-user-email">
							{{ emailAddress }}
						</div>
					</div>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
// components
import Avatar from "../Avatar";

// icons
import DashboardIcon from "../../components/icons/Dashboard";

export default {
	name: "DashboardSidebar",
	components: {
		// components
		Avatar,

		// icons
		DashboardIcon
	},
	computed: {
		fullname() {
			const name = this.$store.getters["user/getUser"];
			return `${name.firstname}${name.lastname ? ` ${name.lastname}` : ""}`;
		},
		username() {
			const name = this.$store.getters["user/getUser"];
			if (name.firstname) {
				return this.fullname;
			}
			return name.username;
		},
		emailAddress() {
			const user = this.$store.getters["user/getUser"];
			return user.emailAddress;
		}
	}
};
</script>

<style lang="sass" scoped>
.sidebar
	display: flex
	flex-direction: column
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

// footer
.sidebar-footer
	margin-top: auto

.sidebar-user-container
	cursor: pointer
	border-radius: $border-radius
	padding: .625rem 1rem

	&:hover
		background-color: rgba($white, .1)

.sidebar-user-container, .sidebar-user
	display: flex
	align-items: center

.sidebar-user-avatar
	margin-right: 0.625rem

.sidebar-user-name
	font-weight: 600
	color: $white

.sidebar-user-email
	color: rgba($white, .5)
	font-size: 0.875rem
</style>

<template>
	<div class="dashboard-sidebar">
		<div class="dashboard-sidebar-header">
			<img src="@/assets/images/logo_invert_color.svg" />
		</div>
		<nav class="dashboard-sidebar-navbar">
			<router-link to="/dashboard" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<dashboard-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">
					Dashbaord
				</div>
			</router-link>
			<router-link to="/dashboard/boards" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<board-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">
					Boards
				</div>
			</router-link>
			<router-link to="/dashboard/posts" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<post-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">
					Posts
				</div>
			</router-link>
		</nav>
		<footer class="dashboard-sidebar-footer">
			<div class="dashboard-sidebar-user-container">
				<div class="dashboard-sidebar-user">
					<avatar class="dashboard-sidebar-user-avatar" :name="username" />
					<div class="dashboard-sidebar-user-data">
						<div class="dashboard-sidebar-user-name">
							{{ fullname }}
						</div>
						<div class="dashboard-sidebar-user-email">
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
import BoardIcon from "../../components/icons/Board";
import PostIcon from "../../components/icons/Post";

export default {
	name: "DashboardSidebar",
	components: {
		// components
		Avatar,

		// icons
		DashboardIcon,
		BoardIcon,
		PostIcon
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

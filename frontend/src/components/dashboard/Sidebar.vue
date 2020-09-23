<template>
	<div class="dashboard-sidebar">
		<router-link to="/dashboard" class="dashboard-sidebar-header">
			<img src="@/assets/images/logo_invert_color.svg" />
		</router-link>
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
			<router-link to="/dashboard/users" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<users-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">
					Users
				</div>
			</router-link>
		</nav>
		<footer class="dashboard-sidebar-footer">
			<div class="dashboard-sidebar-user-container">
				<div class="dashboard-sidebar-user">
					<avatar
						class="dashboard-sidebar-user-avatar"
						:src="userAvatar"
						:name="fullname"
					/>
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

// mixins
import userAvatar from "../../mixins/userAvatar";

// icons
import DashboardIcon from "../../components/icons/Dashboard";
import BoardIcon from "../../components/icons/Board";
import PostIcon from "../../components/icons/Post";
import UsersIcon from "../../components/icons/Users";

export default {
	name: "DashboardSidebar",
	components: {
		// components
		Avatar,

		// icons
		DashboardIcon,
		BoardIcon,
		PostIcon,
		UsersIcon
	},
	mixins: [userAvatar],
	computed: {
		emailAddress() {
			const user = this.$store.getters["user/getUser"];
			return user.emailAddress;
		}
	}
};
</script>

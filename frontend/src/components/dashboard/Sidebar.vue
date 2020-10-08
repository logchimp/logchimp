<template>
	<div class="dashboard-sidebar">
		<router-link to="/dashboard" class="site-info dashboard-sidebar-header">
			<img class="site-logo" :src="getSiteSittings.logo" />
			<h5 class="site-name">{{ getSiteSittings.title }}</h5>
		</router-link>
		<nav class="dashboard-sidebar-navbar">
			<router-link to="/dashboard" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<dashboard-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">Dashbaord</div>
			</router-link>
			<router-link to="/dashboard/boards" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<board-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">Boards</div>
			</router-link>
			<router-link to="/dashboard/posts" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<post-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">Posts</div>
			</router-link>
			<router-link to="/dashboard/users" class="dashboard-sidebar-navbar-item">
				<div class="dashboard-sidebar-navbar-icon">
					<users-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">Users</div>
			</router-link>
			<router-link
				to="/dashboard/settings"
				class="dashboard-sidebar-navbar-item"
			>
				<div class="dashboard-sidebar-navbar-icon">
					<settings-icon />
				</div>
				<div class="dashboard-sidebar-navbar-content">Settings</div>
			</router-link>
		</nav>
		<footer
			@mouseleave="addDashboardSidebarFooterDropdownListener"
			class="dashboard-sidebar-footer"
		>
			<dropdown
				v-show="dashboardSidebarDropdown"
				class="dashboard-sidebar-dropdown"
			>
				<dropdown-item @click="aboutLogChimp">
					<template v-slot:icon>
						<info-icon />
					</template>
					About LogChimp
				</dropdown-item>
				<dropdown-item @click="tweetLogChimp">
					<template v-slot:icon>
						<twitter-icon />
					</template>
					Tweet @LogChimp!
				</dropdown-item>
				<dropdown-spacer />
				<dropdown-item @click="signOut">
					<template v-slot:icon>
						<logout-icon />
					</template>
					Sign Out
				</dropdown-item>
			</dropdown>
			<div
				@click="toggleDashboardSidebarDropdown"
				class="dashboard-sidebar-user-container"
			>
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
import Dropdown from "../dropdown/Dropdown";
import DropdownItem from "../dropdown/DropdownItem";
import DropdownSpacer from "../dropdown/DropdownSpacer";

// mixins
import userAvatar from "../../mixins/userAvatar";

// icons
import DashboardIcon from "../../components/icons/Dashboard";
import BoardIcon from "../../components/icons/Board";
import PostIcon from "../../components/icons/Post";
import UsersIcon from "../../components/icons/Users";
import SettingsIcon from "../../components/icons/Settings";
import InfoIcon from "../../components/icons/Info";
import TwitterIcon from "../../components/icons/Twitter";
import LogoutIcon from "../../components/icons/Logout";

export default {
	name: "DashboardSidebar",
	data() {
		return {
			dashboardSidebarDropdown: false
		};
	},
	components: {
		// components
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownSpacer,

		// icons
		DashboardIcon,
		BoardIcon,
		PostIcon,
		UsersIcon,
		SettingsIcon,
		InfoIcon,
		TwitterIcon,
		LogoutIcon
	},
	mixins: [userAvatar],
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		emailAddress() {
			const user = this.$store.getters["user/getUser"];
			return user.emailAddress;
		}
	},
	methods: {
		// event listener to hide dropdown by clicking outside
		addDashboardSidebarFooterDropdownListener() {
			document.addEventListener(
				"click",
				this.removeDashboardSidebarFooterDropdownListener
			);
		},
		removeDashboardSidebarFooterDropdownListener() {
			this.toggleDashboardSidebarDropdown();
			document.removeEventListener(
				"click",
				this.removeDashboardSidebarFooterDropdownListener
			);
		},
		toggleDashboardSidebarDropdown() {
			this.dashboardSidebarDropdown = !this.dashboardSidebarDropdown;
		},
		aboutLogChimp() {
			window.open("https://logchimp.codecarrot.net/");
		},
		tweetLogChimp() {
			window.open(
				"https://twitter.com/intent/tweet?text=%40LogChimp+Hi%21+Can+you+help+me+with+&related=LogChimp"
			);
		},
		signOut() {
			this.$store.dispatch("user/logout");
			this.dashboardSidebarDropdown = false;
			this.$router.push("/");
		}
	}
};
</script>

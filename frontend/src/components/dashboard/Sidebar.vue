<template>
	<div class="sidebar">
		<header>
			<router-link to="/dashboard" class="site-info">
				<img
					class="site-logo"
					:src="getSiteSittings.logo"
					:alt="getSiteSittings.title"
				>
				<h5 class="site-name">
					{{ getSiteSittings.title }}
				</h5>
			</router-link>
		</header>
		<div class="sidebar-list">
			<h6>Manage</h6>
			<li>
				<router-link to="/dashboard" class="sidebar-list-item">
					<dashboard-icon />
					<p>Dashbaord</p>
				</router-link>
			</li>
			<li>
				<router-link to="/dashboard/boards" class="sidebar-list-item">
					<board-icon />
					<p>Boards</p>
				</router-link>
			</li>
			<li>
				<router-link to="/dashboard/roadmaps" class="sidebar-list-item">
					<roadmap-icon />
					<p>Roadmaps</p>
				</router-link>
			</li>
			<li>
				<router-link to="/dashboard/posts" class="sidebar-list-item">
					<post-icon />
					<p>Posts</p>
				</router-link>
			</li>
			<li>
				<router-link to="/dashboard/users" class="sidebar-list-item">
					<users-icon />
					<p>Users</p>
				</router-link>
			</li>
		</div>

		<div class="sidebar-list">
			<h6>Settings</h6>
			<li>
				<router-link to="/dashboard/settings/general" class="sidebar-list-item">
					<settings-icon />
					<p>General</p>
				</router-link>
			</li>
		</div>
		<footer @mouseleave="addDashboardSidebarFooterDropdownListener">
			<dropdown
				v-show="dashboardSidebarDropdown"
				class="dashboard-sidebar-dropdown"
			>
				<dropdown-item @click="aboutLogChimp">
					<template #icon>
						<info-icon />
					</template>
					About LogChimp
				</dropdown-item>
				<dropdown-item @click="tweetLogChimp">
					<template #icon>
						<twitter-icon />
					</template>
					Tweet @LogChimp!
				</dropdown-item>
				<dropdown-spacer />
				<dropdown-item @click="signOut">
					<template #icon>
						<logout-icon />
					</template>
					Sign Out
				</dropdown-item>
			</dropdown>
			<div
				class="dashboard-sidebar-user-container"
				@click="toggleDashboardSidebarDropdown"
			>
				<div class="dashboard-sidebar-user">
					<avatar
						class="dashboard-sidebar-user-avatar"
						:src="user.avatar"
						:name="user.name || user.username"
					/>
					<div class="dashboard-sidebar-user-data">
						<div class="dashboard-sidebar-user-name">
							{{ user.name || user.username }}
						</div>
						<div class="dashboard-sidebar-user-email">
							{{ user.email }}
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

// icons
import DashboardIcon from "../../components/icons/Dashboard";
import BoardIcon from "../../components/icons/Board";
import RoadmapIcon from "../../components/icons/Roadmap";
import PostIcon from "../../components/icons/Post";
import UsersIcon from "../../components/icons/Users";
import SettingsIcon from "../../components/icons/Settings";
import InfoIcon from "../../components/icons/Info";
import TwitterIcon from "../../components/icons/Twitter";
import LogoutIcon from "../../components/icons/Logout";

export default {
	name: "DashboardSidebar",
	components: {
		// components
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownSpacer,

		// icons
		DashboardIcon,
		BoardIcon,
		RoadmapIcon,
		PostIcon,
		UsersIcon,
		SettingsIcon,
		InfoIcon,
		TwitterIcon,
		LogoutIcon
	},
	data() {
		return {
			dashboardSidebarDropdown: false
		};
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		user() {
			return this.$store.getters["user/getUser"];
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

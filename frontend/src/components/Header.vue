<template>
	<header class="header">
		<div class="container">
			<div class="header-container">
				<router-link to="/" class="site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					>
					<h5 class="site-name">
						{{ getSiteSittings.title }}
					</h5>
				</router-link>
				<nav class="header-nav">
					<div
						v-if="isAuthenticated"
						class="nav-item"
						@mouseleave="addHeaderDropdownListener"
					>
						<avatar
							class="nav-profile"
							:src="user.avatar"
							:name="user.name || user.username"
							@click="toggleProfileDropdown"
						/>
						<dropdown v-show="profileDropdown" class="nav-profile-dropdown">
							<dropdown-item v-if="accessDashboard" @click="openDashboard">
								<template #icon>
									<dashboard-icon />
								</template>
								Dashbaord
							</dropdown-item>
							<dropdown-item @click="settings">
								<template #icon>
									<settings-icon />
								</template>
								Settings
							</dropdown-item>
							<dropdown-spacer />
							<dropdown-item @click="logout">
								<template #icon>
									<logout-icon />
								</template>
								Sign out
							</dropdown-item>
						</dropdown>
					</div>
					<div v-if="!isAuthenticated" class="nav-item nav-auth">
						<Button type="text" @click="login">
							Login
						</Button>
						<Button type="outline" @click="join">
							Create an account
						</Button>
					</div>
				</nav>
			</div>
			<navbar />
		</div>
	</header>
</template>

<script>
// components
import Navbar from "./Navbar";
import Dropdown from "./dropdown/Dropdown";
import DropdownItem from "./dropdown/DropdownItem";
import DropdownSpacer from "./dropdown/DropdownSpacer";
import Button from "./Button";
import Avatar from "./Avatar";

// icons
import DashboardIcon from "./icons/Dashboard";
import SettingsIcon from "./icons/Settings";
import LogoutIcon from "./icons/Logout";

export default {
	name: "Header",
	components: {
		// components
		Navbar,
		Dropdown,
		DropdownItem,
		DropdownSpacer,
		Button,
		Avatar,

		// icons
		DashboardIcon,
		SettingsIcon,
		LogoutIcon
	},
	data() {
		return {
			profileDropdown: false
		};
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		accessDashboard() {
			const permissions = this.$store.getters["user/getPermissions"];
			const acessDashboardPermission = permissions.find(
				item => item === "dashboard:read"
			);

			return acessDashboardPermission;
		},
		isAuthenticated() {
			const token = this.$store.getters["user/getAuthToken"];
			return !!token;
		},
		user() {
			return this.$store.getters["user/getUser"];
		}
	},
	methods: {
		// event listener to hide dropdown by clicking outside
		addHeaderDropdownListener() {
			document.addEventListener("click", this.removeHeaderDropdownListener);
		},
		removeHeaderDropdownListener() {
			this.toggleProfileDropdown();
			document.removeEventListener("click", this.removeHeaderDropdownListener);
		},
		toggleProfileDropdown() {
			this.profileDropdown = !this.profileDropdown;
		},
		openDashboard() {
			this.$router.push("/dashboard");
			this.profileDropdown = false;
		},
		settings() {
			this.$router.push("/settings");
			this.profileDropdown = false;
		},
		login() {
			this.$router.push("/login");
		},
		join() {
			this.$router.push("/join");
		},
		logout() {
			this.$store.dispatch("user/logout");
			this.profileDropdown = false;
			if (this.$route.path !== "/") {
				this.$router.push("/");
			}
		}
	}
};
</script>

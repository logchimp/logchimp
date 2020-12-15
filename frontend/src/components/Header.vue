<template>
	<header class="header">
		<div class="container">
			<div class="header-container">
				<router-link to="/" class="site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					/>
					<h5 class="site-name">{{ getSiteSittings.title }}</h5>
				</router-link>
				<nav class="header-nav">
					<div
						v-if="isAuthenticated"
						@mouseleave="addHeaderDropdownListener"
						class="nav-item"
					>
						<avatar
							@click="toggleProfileDropdown"
							class="nav-profile"
							:src="user.avatar"
							:name="user.name"
						/>
						<dropdown v-show="profileDropdown" class="nav-profile-dropdown">
							<dropdown-item @click="openDashboard">
								<template v-slot:icon>
									<dashboard-icon />
								</template>
								Dashbaord
							</dropdown-item>
							<dropdown-item @click="settings">
								<template v-slot:icon>
									<settings-icon />
								</template>
								Settings
							</dropdown-item>
							<dropdown-spacer />
							<dropdown-item @click="logout">
								<template v-slot:icon>
									<logout-icon />
								</template>
								Sign out
							</dropdown-item>
						</dropdown>
					</div>
					<div v-if="!isAuthenticated" class="nav-item nav-auth">
						<Button @click="login" type="text">
							Login
						</Button>
						<Button @click="join" type="outline">
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
	data() {
		return {
			profileDropdown: false
		};
	},
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
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		userIsOwner() {
			const user = this.$store.getters["user/getUser"];
			return user.isOwner;
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

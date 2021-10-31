<template>
	<header class="header">
		<div class="container">
			<div class="header-container">
				<site-branding :settings="settings" :dashboard="false" />
				<nav class="header-nav">
					<dropdown-wrapper v-if="isAuthenticated" class="nav-item">
						<template #toggle>
							<avatar
								class="nav-profile"
								:src="user.avatar"
								:name="user.name || user.username"
							/>
						</template>
						<template #default="dropdown">
							<dropdown v-if="dropdown.active" class="nav-profile-dropdown sw">
								<dropdown-item v-if="accessDashboard" @click="openDashboard">
									<template #icon>
										<dashboard-icon />
									</template>
									Dashbaord
								</dropdown-item>
								<dropdown-item @click="userSettingsPage">
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
								<dropdown-item v-if="showVersion" :disabled="true">
									{{ version }}
								</dropdown-item>
							</dropdown>
						</template>
					</dropdown-wrapper>
					<div v-else class="nav-item nav-auth">
						<Button type="primary" href="/login"> Login </Button>
						<Button
							v-if="settings.allowSignup"
							type="primary"
							:outline="true"
							href="/join"
						>
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
// packages
import { mapGetters } from "vuex";
import {
	LayoutDashboard as DashboardIcon,
	Settings as SettingsIcon,
	LogOut as LogoutIcon
} from "lucide-vue";

// components
import Navbar from "./Navbar.vue";
import SiteBranding from "./site/SiteBranding.vue";
import DropdownWrapper from "./ui/dropdown/DropdownWrapper.vue";
import Dropdown from "./ui/dropdown/Dropdown.vue";
import DropdownItem from "./ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "./ui/dropdown/DropdownSpacer.vue";
import Button from "./ui/Button.vue";
import Avatar from "./ui/Avatar.vue";

export default {
	name: "Header",
	components: {
		// components
		Navbar,
		SiteBranding,
		DropdownWrapper,
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
		...mapGetters("settings", {
			settings: "get"
		}),
		...mapGetters("user", {
			permissions: "getPermissions"
		}),
		accessDashboard() {
			return this.permissions.includes("dashboard:read");
		},
		isAuthenticated() {
			const token = this.$store.getters["user/getAuthToken"];
			return !!token;
		},
		user() {
			return this.$store.getters["user/getUser"];
		},
		showVersion() {
			return (
				this.permissions.includes("dashboard:read") &&
				this.settings.developer_mode
			);
		},
		version() {
			return process.env.version;
		}
	},
	methods: {
		openDashboard() {
			this.$router.push("/dashboard");
		},
		userSettingsPage() {
			this.$router.push("/settings");
		},
		logout() {
			this.$store.dispatch("user/logout");

			// remove user from localStorage on client-side
			if (!process.server) {
				localStorage.removeItem("user");
			}

			if (this.$router.currentRoute.fullPath !== "/") this.$router.push("/");
		}
	}
};
</script>

<style lang='sass'>
.header
	background-color: var(--color-brand-color)

.header-container, .nav-item
	display: flex
	align-items: center

.header-container
	padding: 1rem 0

// nav
.header-nav
	margin-left: auto

.nav-item
	margin-left: 1.5rem
	color: rgba(255, 255, 255, 0.5)
	font-weight: 500
	position: relative

	&:first-child
		margin-left: 0

.nav-profile
	cursor: pointer

.nav-profile-dropdown
	top: 2.4rem

.nav-auth-link
	cursor: pointer

	&:hover
		color: var(--color-white)
</style>

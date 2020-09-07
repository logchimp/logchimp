<template>
	<header class="header">
		<div class="container header__container">
			<router-link to="/" class="header__logo">
				<img src="@/assets/images/logo_invert_color.svg" />
			</router-link>
			<nav class="header__nav">
				<div class="nav__list">
					<div v-if="isAuthenticated" class="nav__item">
						<avatar
							@click="toggleProfileDropdown"
							class="nav__profile"
							:name="username"
						/>
						<dropdown v-show="profileDropdown" class="nav__profile-dropdown">
							<dropdown-item v-if="userIsOwner" @click="openDashboard">
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
							<dropdown-item @click="logout">
								<template v-slot:icon>
									<logout-icon />
								</template>
								Sign out
							</dropdown-item>
						</dropdown>
					</div>
					<div v-if="!isAuthenticated" class="nav__item nav__auth">
						<Button @click="login" type="text">
							Login
						</Button>
						<Button @click="join" type="outline">
							Create an account
						</Button>
					</div>
				</div>
			</nav>
		</div>
	</header>
</template>

<script>
// components
import Dropdown from "./dropdown/DropdownGroup";
import DropdownItem from "./dropdown/DropdownItem";
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
		Dropdown,
		DropdownItem,
		Button,
		Avatar,
		DashboardIcon,
		SettingsIcon,
		LogoutIcon
	},
	computed: {
		userIsOwner() {
			const user = this.$store.getters["user/getUser"];
			return user.isOwner;
		},
		isAuthenticated() {
			const token = this.$store.getters["user/getAuthToken"];
			return !!token;
		},
		username() {
			const name = this.$store.getters["user/getUser"];
			if (name.firstname) {
				return `${name.firstname}${name.lastname ? ` ${name.lastname}` : ""}`;
			}
			return name.username;
		}
	},
	methods: {
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
			this.$router.push("/");
		}
	}
};
</script>

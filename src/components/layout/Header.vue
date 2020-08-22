<template>
	<div class="header">
		<header>
			<div class="container header__container">
				<router-link to="/" class="header__logo">
					<img src="@/assets/images/logo_invert_color.svg" />
				</router-link>
				<nav class="header__nav">
					<div class="nav__list">
						<div v-if="isAuthenticated" class="nav__item">
							<img
								@click="toggleProfileDropdown"
								class="nav__profile"
								src="https://picsum.photos/200"
							/>
							<dropdown v-show="profileDropdown" class="nav__profile-dropdown">
								<dropdown-item>
									<template v-slot:icon>
										<settings-icon />
									</template>
									Settings
								</dropdown-item>
								<dropdown-item @click.native="logout">
									<template v-slot:icon>
										<logout-icon />
									</template>
									Sign out
								</dropdown-item>
							</dropdown>
						</div>
						<div v-if="!isAuthenticated" class="nav__item nav__auth">
							<Button @click.native="login" type="text">
								Login
							</Button>
							<Button @click.native="join" type="outline">
								Create an account
							</Button>
						</div>
					</div>
				</nav>
			</div>
		</header>
		<auth-modal v-if="authModal" />
	</div>
</template>

<script>
// components
import Dropdown from "../ui/dropdown/DropdownGroup";
import DropdownItem from "../ui/dropdown/DropdownItem";
import Button from "../ui/Button";

// icons
import SettingsIcon from "../../assets/images/icons/settings";
import LogoutIcon from "../../assets/images/icons/logout";

export default {
	name: "Header",
	data() {
		return {
			profileDropdown: false,
			authModal: false
		};
	},
	components: {
		Dropdown,
		DropdownItem,
		Button,
		SettingsIcon,
		LogoutIcon
	},
	computed: {
		isAuthenticated() {
			const token = this.$store.getters["member/getAuthToken"];
			return !!token;
		}
	},
	methods: {
		toggleProfileDropdown() {
			this.profileDropdown = !this.profileDropdown;
		},
		login() {
			this.$router.push("/login");
		},
		join() {
			this.$router.push("/join");
		},
		logout() {
			this.$store.dispatch("member/logout");
			this.profileDropdown = false;
			this.$router.push("/");
		}
	}
};
</script>

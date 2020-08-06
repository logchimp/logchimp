<template>
	<div class="header">
		<header>
			<div class="container header__container">
				<router-link to="/" class="header__logo">
					<img src="@/assets/images/logo_invert_color.svg" />
				</router-link>
				<nav class="header__nav">
					<div class="nav__list">
						<div class="nav__item">
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
								<dropdown-item>
									<template v-slot:icon>
										<logout-icon />
									</template>
									Sign out
								</dropdown-item>
							</dropdown>
						</div>
						<div @click="toggleAuthModal" class="nav__item nav__auth">
							<div class="nav__auth-link">Login</div>
							/
							<div class="nav__auth-link">Signup</div>
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
import AuthModal from "./Auth";

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
		AuthModal,
		SettingsIcon,
		LogoutIcon
	},
	methods: {
		toggleProfileDropdown() {
			this.profileDropdown = !this.profileDropdown;
		},
		toggleAuthModal() {
			this.authModal = !this.authModal;
		}
	}
};
</script>

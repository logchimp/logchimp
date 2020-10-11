<template>
	<div class="navbar">
		<nuxt-link to="/" class="navbar-item">
			<div class="navbar-item-icon">
				<HomeIcon />
			</div>
			<div class="navbar-item-content">
				Home
			</div>
		</nuxt-link>
		<nuxt-link to="/boards" class="navbar-item">
			<div class="navbar-item-icon">
				<ColumnsIcon />
			</div>
			<div class="navbar-item-content">
				Boards
			</div>
		</nuxt-link>
	</div>
</template>

<script>
// packages
import { Home, Columns } from "lucide";

// mixins
import lucideIcon from "@/mixins/lucideIcon.js";

// icons
const HomeIcon = lucideIcon("Home", Home);
const ColumnsIcon = lucideIcon("Columns", Columns);

export default {
	name: "Navbar",
	components: {
		HomeIcon,
		ColumnsIcon
	}
};
</script>

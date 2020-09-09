<template>
	<div class="navbar">
		<router-link to="/" class="navbar-item">
			<div class="navbar-item-icon">
				<home-icon />
			</div>
			<div class="navbar-item-content">
				Home
			</div>
		</router-link>
	</div>
</template>

<script>
// icons
import HomeIcon from "./icons/Home";

export default {
	name: "Navbar",
	components: {
		// icons
		HomeIcon
	}
};
</script>

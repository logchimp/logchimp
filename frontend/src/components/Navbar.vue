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
		<router-link to="/boards" class="navbar-item">
			<div class="navbar-item-icon">
				<board-icon />
			</div>
			<div class="navbar-item-content">
				Boards
			</div>
		</router-link>
	</div>
</template>

<script>
// icons
import HomeIcon from "./icons/Home";
import BoardIcon from "./icons/Board";

export default {
	name: "Navbar",
	components: {
		// icons
		HomeIcon,
		BoardIcon
	}
};
</script>

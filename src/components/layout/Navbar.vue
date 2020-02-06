<template>
	<div class="navbar">
		<div class="container navbar__container">
			<div class="navbar__list">
				<router-link to="/" class="navbar__item">
					<div class="navbar__item-icon">
						<home-icon />
					</div>
					<div class="navbar__item-content">
						Home
					</div>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// icons
import HomeIcon from "../../assets/images/home";

export default {
	name: "AppNavbar",
	components: {
		HomeIcon
	}
}
</script>

<template>
	<l-form>
		<div class="site-setup-card-header">
			<h4 class="site-setup-card-header-heading">Setup your LogChimp site</h4>
			<p class="site-setup-card-header-label">
				Complete your LogChimp site setup to access dashboard.
			</p>
		</div>
		<div class="site-setup-card-button">
			<l-button type="primary" @click="setupSite">
				Create owner account
			</l-button>
		</div>
		<img
			class="site-setup-card-image"
			src="@/assets/images/dashboard-loading-skeleton.png"
			alt="Dashboard loading skeleton"
		/>
	</l-form>
</template>

<script>
// components
import LForm from "./LForm";
import LButton from "./LButton";

export default {
	name: "SiteSetupCard",
	components: {
		LForm,
		LButton
	},
	methods: {
		setupSite() {
			this.$router.push("/setup/welcome");
		}
	}
};
</script>

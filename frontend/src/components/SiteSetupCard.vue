<template>
	<Form>
		<div class="site-setup-card-header">
			<h4 class="site-setup-card-header-heading">Setup your LogChimp site</h4>
			<p class="site-setup-card-header-label">
				Complete your LogChimp site setup to access dashboard.
			</p>
		</div>
		<div class="site-setup-card-button">
			<Button type="primary" @click="setupSite">
				Create owner account
			</Button>
		</div>
		<img
			class="site-setup-card-image"
			src="@/assets/images/dashboard-loading-skeleton.png"
			alt="Dashboard loading skeleton"
		/>
	</Form>
</template>

<script>
// components
import Form from "./Form";
import Button from "./Button";

export default {
	name: "SiteSetupCard",
	components: {
		Form,
		Button
	},
	methods: {
		setupSite() {
			this.$router.push("/setup/welcome");
		}
	}
};
</script>

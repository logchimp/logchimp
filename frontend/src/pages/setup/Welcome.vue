<template>
	<div class="onboarding-content">
		<h2 class="onboarding-heading">Welcome to <span>LogChimp</span>!</h2>
		<p class="onboarding-label">
			Let’s setup your LogChimp site to track user feedback for building better
			products.
		</p>
		<img
			class="welcome-image"
			src="@/assets/images/logchimp_homepage_preview.png"
			alt="LogChimp homepage preview"
		/>
		<Button type="primary" @click="createAccount" class="welcome-button">
			Create an account
		</Button>
	</div>
</template>

<script>
// components
import Button from "../../components/Button";

export default {
	name: "OnboardingWelcome",
	components: {
		Button
	},
	methods: {
		createAccount() {
			this.$router.push("/setup/create-account");
		}
	}
};
</script>

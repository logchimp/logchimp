<template>
	<div class="onboarding__content">
		<h2 class="onboarding__heading">Welcome to <span>LogChimp</span>!</h2>
		<p class="onboarding__label">
			Let’s setup your LogChimp site to track user feedback for building better
			products.
		</p>
		<img
			class="welcome__image"
			src="@/assets/images/logchimp_homepage_preview.png"
			alt="LogChimp homepage preview"
		/>
		<Button type="primary" @click="createAccount" class="welcome__button">
			Create an account
		</Button>
	</div>
</template>

<script>
// components
import Button from "../../components/ui/Button";

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

<style lang="sass" scoped>
.welcome__image
	width: 100%
	border-radius: $border-radius
	border: 1px solid $gray-90

.welcome__button
	margin-top: 4rem
</style>

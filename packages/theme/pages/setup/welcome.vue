<template>
	<div class="onboarding onboarding-content">
		<div class="onboarding-header">
			<h2 class="onboarding-heading">Welcome to <span>LogChimp</span>!</h2>
			<p class="onboarding-label">
				Let’s setup your LogChimp site to track user feedback for building
				better products.
			</p>
		</div>
		<img
			class="welcome-image"
			src="https://cdn.logchimp.codecarrot.net/logchimp-home-preview.png"
			alt="LogChimp homepage preview"
		/>
		<Button type="primary" class="welcome-button" href="/setup/create-account">
			Create an account
		</Button>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// components
import Button from "../../components/ui/Button.vue";

export default {
	name: "SetupWelcome",
	layout: "onboarding",
	components: {
		// components
		Button
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	head() {
		return {
			title: `Welcome • Onboarding • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Welcome • Onboarding • ${this.settings.title}`
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.welcome-image
	width: 100%
	border-radius: var(--border-radius-default)
	border: 1px solid var(--color-gray-90)

.welcome-button
	margin-top: 4rem
</style>

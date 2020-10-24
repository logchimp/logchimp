<template>
	<div class="onboarding-content">
		<div class="onboarding-header">
			<h2 class="onboarding-heading">Welcome to <span>LogChimp</span>!</h2>
			<p class="onboarding-label">
				Let’s setup your LogChimp site to track user feedback for building
				better products.
			</p>
		</div>
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
	name: "SetupWelcome",
	components: {
		Button
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		createAccount() {
			this.$router.push("/setup/create-account");
		}
	},
	metaInfo() {
		return {
			title: "Welcome · Onboarding",
			meta: [
				{
					name: "og:title",
					content: `Welcome · Onboarding · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

<template>
	<div class="homepage">
		<main class="homepage-posts" />
		<aside class="homepage-sidebar">
			<site-setup-card v-if="showSiteSetupCard" />
		</aside>
	</div>
</template>

<script>
// components
import SiteSetupCard from "@/components/SiteSetupCard";

export default {
	name: "Homepage",
	data() {
		return {
			showSiteSetupCard: false
		};
	},
	components: {
		// components
		SiteSetupCard
	},
	computed: {
		// getSiteSittings() {
		// 	return this.$store.getters["settings/get"];
		// }
	},
	methods: {
		async isSetup() {
			try {
				const response = await this.$axios.$get("/api/v1/auth/isSetup");
				this.showSiteSetupCard = !response.isSetup;
			} catch (error) {
				console.error(error);
			}
		}
	},
	created() {
		this.isSetup();
	}
	// head() {
	// 	return {
	// 		title: "Home",
	// 		meta: [
	// 			{
	// 				name: "og:title",
	// 				content: `Home · ${this.getSiteSittings.title}`
	// 			}
	// 		]
	// 	};
	// }
};
</script>

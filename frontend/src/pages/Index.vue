<template>
	<div class="homepage">
		<main class="homepage-posts" />
		<aside class="homepage-sidebar">
			<site-setup-card v-if="showSiteSetupCard" />
		</aside>
	</div>
</template>

<script>
// modules
import { isSiteSetup } from "../modules/site";

// components
import SiteSetupCard from "../components/SiteSetupCard";

export default {
	name: "Homepage",
	components: {
		// components
		SiteSetupCard
	},
	data() {
		return {
			showSiteSetupCard: false
		};
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	created() {
		this.isSetup();
	},
	methods: {
		async isSetup() {
			try {
				const response = await isSiteSetup();
				this.showSiteSetupCard = !response.data.is_setup;
			} catch (error) {
				console.error(error);
			}
		}
	},
	metaInfo() {
		return {
			title: "Home",
			meta: [
				{
					name: "og:title",
					content: `Home · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

<template>
	<div class="homepage">
		<main class="homepage-posts" />
		<aside class="homepage-sidebar">
			<site-setup-card v-if="showSiteSetupCard" />
			<login-card v-if="!isUserLoggedIn && !showSiteSetupCard" />
		</aside>
	</div>
</template>

<script>
// modules
import { isSiteSetup } from "../modules/site";

// components
import SiteSetupCard from "../components/SiteSetupCard";
import LoginCard from "../components/LoginCard";

export default {
	name: "Homepage",
	components: {
		// components
		SiteSetupCard,
		LoginCard
	},
	data() {
		return {
			showSiteSetupCard: false
		};
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		isUserLoggedIn() {
			const user = this.$store.getters["user/getUserId"];
			return !!user;
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

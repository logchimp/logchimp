<template>
	<div class="homepage">
		<main class="homepage-posts" />
		<aside class="homepage-sidebar">
			<site-setup-card v-if="showSiteSetupCard" />
		</aside>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import SiteSetupCard from "../components/SiteSetupCard";

export default {
	name: "HomePage",
	data() {
		return {
			showSiteSetupCard: false
		};
	},
	components: {
		// components
		SiteSetupCard
	},
	methods: {
		isSetup() {
			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/isSetup`)
				.then(response => {
					this.showSiteSetupCard = !response.data.isSetup;
				})
				.catch(error => {
					console.error(error);
				});
		}
	},
	created() {
		this.isSetup();
	}
};
</script>

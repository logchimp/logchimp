<template>
	<div class="homepage">
		<main class="homepage-posts">
			<tab>
				<tab-item
					@click="updateTab('latest')"
					:class="{
						'tab-item-active': tab === 'latest'
					}"
				>
					<template v-slot:icon>
						<sort-desc-icon />
					</template>
					Latest
				</tab-item>
				<tab-item
					@click="updateTab('oldest')"
					:class="{
						'tab-item-active': tab === 'oldest'
					}"
				>
					<template v-slot:icon>
						<sort-asc-icon />
					</template>
					Oldest
				</tab-item>
			</tab>

			<component :is="homeTab"></component>
		</main>
		<aside class="homepage-sidebar">
			<site-setup-card v-if="showSiteSetupCard" />
		</aside>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Tab from "../components/tab/Tab";
import TabItem from "../components/tab/TabItem";
import LatestPosts from "../components/post/LatestPosts";
import OldestPosts from "../components/post/OldestPosts";
import SiteSetupCard from "../components/SiteSetupCard";

// icons
import SortDescIcon from "../components/icons/SortDesc";
import SortAscIcon from "../components/icons/SortAsc";

export default {
	name: "HomePage",
	data() {
		return {
			tab: "latest",
			showSiteSetupCard: false
		};
	},
	components: {
		// components
		Tab,
		TabItem,
		LatestPosts,
		OldestPosts,
		SiteSetupCard,

		// icons
		SortDescIcon,
		SortAscIcon
	},
	computed: {
		homeTab() {
			switch (this.tab) {
				case "oldest":
					return OldestPosts;
				case "latest":
				default:
					return LatestPosts;
			}
		}
	},
	methods: {
		updateTab(tabValue) {
			this.tab = tabValue;
		},
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

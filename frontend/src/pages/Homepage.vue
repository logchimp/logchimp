<template>
	<div class="homepage">
		<div class="homepage-posts">
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
		</div>
		<div class="homepage-createpost">
			<create-post />
		</div>
	</div>
</template>

<script>
// components
import Tab from "../components/tab/Tab";
import TabItem from "../components/tab/TabItem";
import LatestPosts from "../components/post/LatestPosts";
import OldestPosts from "../components/post/OldestPosts";
import CreatePost from "../components/post/CreatePost";

// icons
import SortDescIcon from "../components/icons/SortDesc";
import SortAscIcon from "../components/icons/SortAsc";

export default {
	name: "HomePage",
	data() {
		return {
			tab: "latest"
		};
	},
	components: {
		// components
		Tab,
		TabItem,
		LatestPosts,
		OldestPosts,
		CreatePost,

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
		}
	}
};
</script>

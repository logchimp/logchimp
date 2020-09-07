<template>
	<div class="homepage">
		<tabs class="homepage__posts">
			<tab-group>
				<tab-item
					@click="updateTab('latest')"
					:class="{
						'tab__item-active': tab === 'latest'
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
						'tab__item-active': tab === 'oldest'
					}"
				>
					<template v-slot:icon>
						<sort-asc-icon />
					</template>
					Oldest
				</tab-item>
			</tab-group>

			<component :is="homeTab"></component>
		</tabs>
		<div class="homepage__createpost">
			<create-post />
		</div>
	</div>
</template>

<script>
// components
import Tabs from "../components/tab/Tabs";
import TabGroup from "../components/tab/TabGroup";
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
		Tabs,
		TabGroup,
		TabItem,
		LatestPosts,
		OldestPosts,
		CreatePost,
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

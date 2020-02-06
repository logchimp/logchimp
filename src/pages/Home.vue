<template>
	<div>
		<tabs>
			<tab-group>
				<tab-item
					@click.native="updateTab('latest')"
					:class="{
						'tab__item-active': tab === 'latest'
					}"
				>
					<template v-slot:icon>
						<bar-icon />
					</template>
					Latest
				</tab-item>
				<tab-item
					@click.native="updateTab('oldest')"
					:class="{
						'tab__item-active': tab === 'oldest'
					}"
				>
					<template v-slot:icon>
						<align-center-icon />
					</template>
					Oldest
				</tab-item>
			</tab-group>

			<component :is="homeTab"></component>
		</tabs>
		<div>
			<create-post />
		</div>
	</div>
</template>

<script>
// components
import Tabs from "../components/ui/tab/Tabs";
import TabGroup from "../components/ui/tab/TabGroup";
import TabItem from "../components/ui/tab/TabItem";
import LatestPosts from "../components/layout/LatestPosts";
import OldestPosts from "../components/layout/OldestPosts";
import CreatePost from "../components/layout/CreatePost";

// icons
import BarIcon from "../assets/images/icons/bar";
import AlignCenterIcon from "../assets/images/icons/alignCenter";

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
		BarIcon,
		AlignCenterIcon
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

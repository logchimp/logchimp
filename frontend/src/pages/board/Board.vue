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

			<component :is="activeTab"></component>
		</main>
		<aside class="homepage-sidebar">
			<create-post :board-id="board.boardId" />
		</aside>
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Tab from "../../components/tab/Tab";
import TabItem from "../../components/tab/TabItem";
import LatestPosts from "../../components/post/LatestPosts";
import OldestPosts from "../../components/post/OldestPosts";
import CreatePost from "../../components/post/CreatePost";

// icons
import SortDescIcon from "../../components/icons/SortDesc";
import SortAscIcon from "../../components/icons/SortAsc";

export default {
	name: "Board",
	data() {
		return {
			tab: "latest",
			board: {}
		};
	},
	components: {
		// packages
		InfiniteLoading,

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
		activeTab() {
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
		getBoard() {
			const slug = this.$route.params.slug;

			axios({
				method: "post",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/boards/${slug}`
			})
				.then(response => {
					this.board = response.data.board;
				})
				.catch(error => {
					console.error(error);
				});
		}
	},
	created() {
		this.getBoard();
	}
};
</script>

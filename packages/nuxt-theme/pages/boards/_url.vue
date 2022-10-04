<template>
	<div class="homepage">
		<main class="homepage-posts">
			<tab>
				<tab-item
					:class="{
						'tab-item-active': tab === 'latest'
					}"
					@click="updateTab('latest')"
				>
					<template #icon>
						<sort-desc-icon />
					</template>
					Latest
				</tab-item>
				<tab-item
					:class="{
						'tab-item-active': tab === 'oldest'
					}"
					@click="updateTab('oldest')"
				>
					<template #icon>
						<sort-asc-icon />
					</template>
					Oldest
				</tab-item>
			</tab>

			<component :is="activeTab" :board="board" />
		</main>
		<aside class="homepage-sidebar">
			<create-post v-if="isAuthenticated" :board-id="board.boardId" />
			<login-card v-else />
		</aside>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import { SortAsc as SortAscIcon, SortDesc as SortDescIcon } from "lucide-vue";
import InfiniteLoading from "vue-infinite-loading";

// components
import Loader from "../../components/ui/Loader.vue";
import Tab from "../../components/ui/tab/Tab.vue";
import TabItem from "../../components/ui/tab/TabItem.vue";
import LatestPosts from "../../components/posts/LatestPosts.vue";
import OldestPosts from "../../components/posts/OldestPosts.vue";
import CreatePost from "../../components/posts/CreatePost.vue";
import LoginCard from "../../components/auth/LoginCard.vue";

export default {
	name: "BoardSlug",
	layout: "viewer",
	components: {
		// packages
		InfiniteLoading,

		// components
		Loader,
		Tab,
		TabItem,
		LatestPosts,
		OldestPosts,
		CreatePost,
		LoginCard,

		// icons
		SortDescIcon,
		SortAscIcon
	},
	data() {
		return {
			tab: "latest"
		};
	},
	async asyncData({ route, $axios, error }) {
		const url = route.params.url;
		try {
			const response = await $axios({
				method: "GET",
				url: `/api/v1/boards/${url}`
			});
			return {
				board: response.data?.board
			};
		} catch (err) {
			error({
				code: err.response.data.code,
				...(err.response.data.code === "BOARD_NOT_FOUND" && {
					notFound: err.response.data.code === "BOARD_NOT_FOUND"
				})
			});
		}
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		isAuthenticated() {
			const user = this.$store.getters["user/getUserId"];
			return !!user;
		},
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
		}
	},
	head() {
		return {
			title: `${this.board.name} • Board • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `${this.board.name} • Board • ${this.settings.title}`
				},
				{
					name: "robots",
					content: `${this.board.display ? "index" : "noindex"}`
				}
			]
		};
	}
};
</script>

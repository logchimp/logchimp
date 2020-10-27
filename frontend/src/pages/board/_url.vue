<template>
	<div v-if="!board.loading">
		<div v-if="isBoardExist">
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
		</div>
		<p v-else>
			There is no such board.
		</p>
	</div>
	<div v-else class="loader-container">
		<loader />
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Loader from "../../components/Loader";
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
			board: {
				loading: false
			},
			isBoardExist: true
		};
	},
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
		},
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		updateTab(tabValue) {
			this.tab = tabValue;
		},
		getBoard() {
			this.board.loading = true;
			const url = this.$route.params.url;

			axios({
				method: "post",
				url: `/api/v1/boards/${url}`
			})
				.then(response => {
					this.board = response.data.board;

					this.board.loading = false;
				})
				.catch(error => {
					if (error.response.data.code === "BOARD_NOT_FOUND") {
						this.isBoardExist = false;
					}

					this.board.loading = false;
				});
		}
	},
	created() {
		this.getBoard();
	},
	metaInfo() {
		return {
			title: `${this.board.name} · Board`,
			meta: [
				{
					name: "og:title",
					content: `${this.board.name} · Board · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

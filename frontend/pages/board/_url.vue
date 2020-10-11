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
	<div v-else class="loader-container loader">
		<loader-icon />
	</div>
</template>

<script>
// packages
import { SortDesc, SortAsc } from "lucide";

// components
import Tab from "@/components/tab/Tab";
import TabItem from "@/components/tab/TabItem";
import LatestPosts from "@/components/post/LatestPosts";
import OldestPosts from "@/components/post/OldestPosts";
import CreatePost from "@/components/post/CreatePost";

// mixins
import lucideIcon from "@/mixins/lucideIcon.js";

// icons
const SortDescIcon = lucideIcon("SortDesc", SortDesc);
const SortAscIcon = lucideIcon("SortAsc", SortAsc);
import LoaderIcon from "@/components/icons/Loader";

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
		// components
		Tab,
		TabItem,
		LatestPosts,
		OldestPosts,
		CreatePost,

		// icons
		SortDescIcon,
		SortAscIcon,
		LoaderIcon
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
		// getSiteSittings() {
		// 	return this.$store.getters["settings/get"];
		// }
	},
	methods: {
		updateTab(tabValue) {
			this.tab = tabValue;
		},
		async getBoard() {
			this.board.loading = true;
			const url = this.$route.params.url;

			try {
				const response = await this.$axios.$post(`/api/v1/boards/${url}`);

				this.board = response.board;
				this.board.loading = false;
			} catch (error) {
				if (error.response.data.code === "BOARD_NOT_FOUND") {
					this.isBoardExist = false;
				}

				this.board.loading = false;
			}
		}
	},
	created() {
		this.getBoard();
	}
	// metaInfo() {
	// 	return {
	// 		title: `${this.board.name} · Board`,
	// 		meta: [
	// 			{
	// 				name: "og:title",
	// 				content: `${this.board.name} · Board · ${this.getSiteSittings.title}`
	// 			}
	// 		]
	// 	};
	// }
};
</script>

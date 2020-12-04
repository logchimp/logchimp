<template>
	<div class="dashboard-overview-posts-and-boards">
		<div class="dashboard-overview-posts">
			<div class="table-heading">
				Posts
			</div>
			<Table>
				<template v-slot:header>
					<div class="table-header-item posts-table-title">
						title
					</div>
					<div class="table-header-item posts-table-votes">
						votes
					</div>
				</template>
				<router-link
					:to="`/dashboard/post/${post.slug}`"
					v-for="post in posts.data"
					:key="post.postId"
					class="table-row"
				>
					<div class="table-data posts-table-title">
						{{ post.title }}
					</div>
					<div class="table-data posts-table-votes">
						{{ post.voters.votesCount }}
					</div>
				</router-link>
				<infinite-loading @infinite="getPosts">
					<div class="loader-container" slot="spinner"><loader /></div>
					<div slot="no-more"></div>
					<div slot="no-results"></div>
					<div slot="error"></div>
				</infinite-loading>
			</Table>
		</div>
		<div class="dashboard-overview-boards">
			<div class="table-heading">
				Boards
			</div>
			<Table>
				<template v-slot:header>
					<div class="table-header-item boards-table-color"></div>
					<div class="table-header-item boards-table-name">
						name
					</div>
					<div class="table-header-item boards-table-posts">
						posts
					</div>
				</template>
				<div
					v-for="board in boards.data"
					:key="board.boardId"
					class="table-row"
				>
					<div class="table-data boards-table-color">
						<div
							class="board-color"
							:style="{
								backgroundColor: `#${board.color}`
							}"
						/>
					</div>
					<div class="table-data boards-table-name">
						{{ board.name }}
					</div>
					<div class="table-data boards-table-posts">
						{{ board.post_count }}
					</div>
				</div>
				<infinite-loading @infinite="getBoards">
					<div class="loader-container" slot="spinner"><loader /></div>
					<div slot="no-more"></div>
					<div slot="no-results"></div>
					<div slot="error"></div>
				</infinite-loading>
			</Table>
		</div>
	</div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getPosts } from "../../modules/posts";
import { getAllBoards } from "../../modules/boards";

// components
import Table from "../../components/Table";
import Loader from "../../components/Loader";

export default {
	name: "DashboardOverview",
	data() {
		return {
			posts: {
				data: [],
				loading: false
			},
			boards: {
				data: [],
				loading: false
			}
		};
	},
	components: {
		// packages
		InfiniteLoading,

		// components
		Table,
		Loader
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async getPosts($state) {
			try {
				const response = await getPosts(1, 4, "desc");

				this.posts.data = response.data;
				$state.complete();
			} catch (error) {
				console.error(error);
				$state.error();
			}
		},
		async getBoards($state) {
			try {
				const response = await getAllBoards(1, 4, "desc");

				this.boards.data = response.data;
				$state.complete();
			} catch (error) {
				console.error(error);
				$state.error();
			}
		}
	},
	metaInfo() {
		return {
			title: "Dashboard",
			meta: [
				{
					name: "og:title",
					content: `Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

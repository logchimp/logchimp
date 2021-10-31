<template>
	<div class="dashboard-overview-posts-and-boards">
		<div class="dashboard-overview-posts">
			<div class="table-heading">Posts</div>
			<Table>
				<template #header>
					<div class="table-header-item posts-table-title">title</div>
					<div class="table-header-item posts-table-votes">votes</div>
				</template>
				<a
					v-for="post in posts.data"
					:key="post.postId"
					:href="`/dashboard/posts/${post.slug}`"
					class="table-row"
				>
					<div class="table-data posts-table-title">
						{{ post.title }}
					</div>
					<div class="table-data posts-table-votes">
						{{ post.voters.votesCount }}
					</div>
				</a>
				<client-only>
					<infinite-loading @infinite="getPosts">
						<div slot="spinner" class="loader-container">
							<loader />
						</div>
						<div slot="no-more" />
						<div slot="no-results" />
						<div slot="error" />
					</infinite-loading>
				</client-only>
			</Table>
		</div>
		<div class="dashboard-overview-boards">
			<div class="table-heading">Boards</div>
			<Table>
				<template #header>
					<div class="table-header-item boards-table-color" />
					<div class="table-header-item boards-table-name">name</div>
					<div class="table-header-item boards-table-posts">posts</div>
				</template>
				<div
					v-for="board in boards.data"
					:key="board.boardId"
					class="table-row"
				>
					<div class="table-data boards-table-color">
						<div
							class="color-dot"
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
				<client-only>
					<infinite-loading @infinite="getBoards">
						<div slot="spinner" class="loader-container">
							<loader />
						</div>
						<div slot="no-more" />
						<div slot="no-results" />
						<div slot="error" />
					</infinite-loading>
				</client-only>
			</Table>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

// components
import Table from "../../components/ui/Table.vue";
import Loader from "../../components/ui/Loader.vue";

export default {
	name: "DashboardOverview",
	layout: "dashboard",
	components: {
		// packages
		InfiniteLoading,

		// components
		Table,
		Loader
	},
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
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	methods: {
		async getPosts($state) {
			try {
				const userId = this.$store.getters["user/getUserId"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/posts/get",
					data: {
						page: 1,
						limit: 4,
						created: "DESC",
						userId
					}
				});

				this.posts.data = response.data.posts;
				$state.complete();
			} catch (error) {
				console.error(error);
				$state.error();
			}
		},
		async getBoards($state) {
			try {
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/boards/get",
					params: {
						page: 1,
						limit: 4,
						created: "DESC"
					}
				});

				this.boards.data = response.data.boards;
				$state.complete();
			} catch (error) {
				console.error(error);
				$state.error();
			}
		}
	},
	head() {
		return {
			title: `Dashboard • ${this.settings.title}`
		};
	}
};
</script>

<style lang='sass'>
.dashboard-overview-posts-and-boards
	display: flex
	align-items: flex-start

.dashboard-overview-posts
	flex: 2
	margin-right: 1rem

.dashboard-overview-boards
	flex: 1
	margin-left: 1rem

// posts
.posts-table-title
	flex: 6
	font-weight: 500

.posts-table-votes
	flex: 1
	text-align: right

// boards
.boards-table-color
	flex: 0.5
	padding-right: 0.5rem

.boards-table-name
	flex: 10
	font-weight: 500
	padding-left: 0.5rem

.boards-table-posts
	flex: 2
	text-align: right
</style>

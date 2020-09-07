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
				<div
					v-for="post in posts.data"
					:key="post.postId"
					class="table-content-item"
				>
					<div class="posts-table-title">
						{{ post.title }}
					</div>
					<div class="posts-table-votes">
						{{ post.voters.length }}
					</div>
				</div>
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
					class="table-content-item"
				>
					<div class="boards-table-color">
						<div
							class="board-color"
							:style="{
								backgroundColor: `#${board.color}`
							}"
						/>
					</div>
					<div class="boards-table-name">
						{{ board.name }}
					</div>
					<div class="boards-table-posts">
						0
					</div>
				</div>
			</Table>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

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
		// components
		Table,
		Loader
	},
	methods: {
		getPosts() {
			this.posts.loading = true;
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts`,
				params: {
					page: 1,
					created: "desc"
				}
			})
				.then(response => {
					this.posts.data = response.data.posts;
					this.posts.loading = false;
				})
				.catch(error => {
					console.log(error);
					this.posts.loading = false;
				});
		},
		getBoards() {
			this.boards.loading = true;
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/boards`,
				params: {
					page: 1,
					created: "desc"
				}
			})
				.then(response => {
					this.boards.data = response.data.boards;
					this.boards.loading = false;
				})
				.catch(error => {
					console.log(error);
					this.boards.loading = false;
				});
		}
	},
	created() {
		this.getPosts();
		this.getBoards();
	}
};
</script>

<style lang="sass" scoped>
.dashboard-overview-posts-and-boards
	display: flex
	align-items: flex-start

.dashboard-overview-posts
	flex: 2
	margin-right: 1rem

.dashboard-overview-boards
	flex: 1
	margin-left: 1rem

.table-heading
	color: $gray-40
	font-size: .875rem
	font-weight: 500
	margin-left: 0.375rem
	margin-bottom: 0.5rem
</style>

<style lang="sass">
// posts
.posts-table-title
	flex: 6
	font-weight: 500

.posts-table-votes
	flex: 1
	text-align: right

// boards
.boards-table-color
	flex: 1

.boards-table-name
	flex: 10
	font-weight: 500

.boards-table-posts
	flex: 2
	text-align: right

.board-color
	width: .75rem
	height: .75rem
	border-radius: 1rem
</style>

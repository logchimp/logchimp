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
				<div v-for="post in posts.data" :key="post.postId" class="table-row">
					<div class="table-data posts-table-title">
						{{ post.title }}
					</div>
					<div class="table-data posts-table-votes">
						{{ post.voters.length }}
					</div>
				</div>
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
				<router-link
					:to="`/dashboard/board/${board.url}`"
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
						{{ board.posts }}
					</div>
				</router-link>
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
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

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
	methods: {
		getPosts($state) {
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts`,
				params: {
					page: 1,
					limit: 4,
					created: "desc"
				}
			})
				.then(response => {
					this.posts.data = response.data.posts;
					$state.complete();
				})
				.catch(error => {
					console.log(error);
					$state.error();
				});
		},
		getBoards($state) {
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/boards`,
				params: {
					page: 1,
					limit: 4,
					created: "desc"
				}
			})
				.then(response => {
					this.boards.data = response.data.boards;
					$state.complete();
				})
				.catch(error => {
					console.log(error);
					$state.error();
				});
		}
	}
};
</script>

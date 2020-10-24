<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">{{ board.name }}</h4>
		</div>
		<div class="homepage">
			<main class="homepage-posts">
				<post
					v-for="post in posts"
					:post="post"
					:key="post.postId"
					:dashboard="true"
				/>
				<infinite-loading @infinite="getBoardPosts">
					<div class="loader-container" slot="spinner"><loader /></div>
					<div slot="no-more"></div>
					<div slot="no-results"></div>
					<div slot="error"></div>
				</infinite-loading>
			</main>
			<aside class="homepage-sidebar">
				<create-post :board-id="board.boardId" :dashboard="true" />
			</aside>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getBoardByUrl } from "../../../../modules/boards";

// components
import Post from "../../../../components/post/Post";
import Loader from "../../../../components/Loader";
import CreatePost from "../../../../components/post/CreatePost";

export default {
	name: "DashboardBoard",
	data() {
		return {
			board: {},
			posts: [],
			page: 1
		};
	},
	components: {
		// packages
		InfiniteLoading,

		// components
		Post,
		Loader,
		CreatePost
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		getBoardPosts($state) {
			const url = this.$route.params.url;

			axios({
				method: "post",
				url: `/api/v1/boards/${url}/posts`,
				params: {
					page: this.page,
					created: "desc"
				}
			})
				.then(response => {
					if (response.data.posts.length) {
						this.posts.push(...response.data.posts);
						this.page += 1;
						$state.loaded();
					} else {
						$state.complete();
					}
				})
				.catch(error => {
					console.error(error);
					$state.error();
				});
		},
		async getBoard() {
			const url = this.$route.params.url;

			try {
				const response = await getBoardByUrl(url);

				this.board = response.data.board;
			} catch (error) {
				console.error(error);
			}
		}
	},
	created() {
		this.getBoard();
	},
	metaInfo() {
		return {
			title: `${this.board.name} · Board · Dashboard`,
			meta: [
				{
					name: "og:title",
					content: `${this.board.name} · Board · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

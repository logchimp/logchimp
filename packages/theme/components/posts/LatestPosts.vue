<template>
	<div>
		<post-item
			v-for="post in posts"
			:key="post.postId"
			:post="post"
			:show-board="false"
		/>
		<client-only>
			<infinite-loading @infinite="getMorePosts">
				<div slot="spinner" class="loader-container">
					<loader />
				</div>
				<div slot="no-more" />
				<div slot="no-results" />
				<div slot="error" />
			</infinite-loading>
		</client-only>
	</div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// components
import PostItem from "../posts/PostItem.vue";
import Loader from "../ui/Loader.vue";

export default {
	name: "LatestPosts",
	components: {
		// packages
		InfiniteLoading,

		// components
		PostItem,
		Loader
	},
	props: {
		board: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	methods: {
		async getMorePosts($state) {
			const boardId = this.board.boardId;

			try {
				const userId = this.$store.getters["user/getUserId"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/posts/get",
					data: {
						page: this.page,
						limit: 10,
						created: "DESC",
						userId,
						boardId: [boardId]
					}
				});

				if (response.data.posts.length) {
					this.posts.push(...response.data.posts);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				console.error(error);
				$state.error();
			}
		}
	}
};
</script>

<template>
	<div>
		<post v-for="post in posts" :post="post" :key="post.postId" />
		<infinite-loading @infinite="getMorePosts">
			<div class="loader-container loader" slot="spinner"><loader-icon /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
			<div slot="error"></div>
		</infinite-loading>
	</div>
</template>

<script>
// components
import Post from "@/components/post/Post";

// icons
import LoaderIcon from "@/components/icons/Loader";

export default {
	name: "OldestPosts",
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	components: {
		// components
		Post,

		// icons
		LoaderIcon
	},
	methods: {
		async getMorePosts($state) {
			const url = this.$route.params.url;

			try {
				const response = await this.$axios.$get(`/api/v1/boards/${url}/posts`, {
					params: {
						page: this.page,
						created: "asc"
					}
				});

				if (response.posts.length) {
					this.posts.push(...response.posts);
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

<template>
	<div>
		<post v-for="post in posts" :post="post" :key="post.postId" />
		<infinite-loading @infinite="getMorePosts">
			<div class="loader-container" slot="spinner"><loader /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
			<div slot="error"></div>
		</infinite-loading>
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Post from "../post/Post";
import Loader from "../Loader";

export default {
	name: "LatestPosts",
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	components: {
		// packages
		InfiniteLoading,

		// components
		Post,
		Loader
	},
	methods: {
		getMorePosts($state) {
			const slug = this.$route.params.slug;

			axios({
				method: "post",
				url: `/api/v1/boards/${slug}/posts`,
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
		}
	}
};
</script>

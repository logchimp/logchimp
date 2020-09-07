<template>
	<div class="latest__post">
		<post v-for="post in posts" :post="post" :key="post.postId" />
		<infinite-loading @infinite="getMorePosts">
			<div class="loader-container" slot="spinner"><loader /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
		</infinite-loading>
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Post from "../layout/Post";
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
			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts`, {
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

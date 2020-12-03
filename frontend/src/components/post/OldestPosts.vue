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
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getBoardPosts } from "../../modules/boards";

// components
import Post from "../post/Post";
import Loader from "../Loader";

export default {
	name: "OldestPosts",
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
	props: {
		board: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	methods: {
		async getMorePosts($state) {
			const url = this.$route.params.url;

			try {
				const response = await getBoardPosts(url, this.page, "asc");
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

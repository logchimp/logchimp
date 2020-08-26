<template>
	<div class="latest__post">
		<post
			v-for="post in posts"
			:title="post.title"
			:slug="post.slug"
			:description="post.contentMarkdown || ''"
			:key="post.postId"
		/>
		<infinite-loading @infinite="getMorePosts">
			<div slot="spinner"><loading /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
		</infinite-loading>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Post from "../layout/Post";
import Loading from "../ui/Loading";

export default {
	name: "LatestPosts",
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	components: {
		Post,
		Loading
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
					$state.complete();
				});
		}
	}
};
</script>

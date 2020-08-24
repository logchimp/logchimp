<template>
	<div class="latest__post">
		<post
			v-for="post in posts"
			:title="post.title"
			:slug="post.slug"
			:description="post.contentMarkdown || ''"
			:key="post.postId"
		/>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Post from "../layout/Post";

export default {
	name: "LatestPosts",
	data() {
		return {
			posts: []
		};
	},
	components: {
		Post
	},
	methods: {
		getPosts() {
			const url = new URL(
				`${process.env.VUE_APP_SEVER_URL}/api/v1/posts?created=desc`
			);

			axios
				.get(url)
				.then(response => {
					this.posts = response.data.posts;
				})
				.catch(error => {
					console.log(error);
				});
		}
	},
	created() {
		this.getPosts();
	}
};
</script>

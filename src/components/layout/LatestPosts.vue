<template>
	<div class="latest__post">
		<post
			v-for="post in posts"
			:title="post.title"
			:slug="post.slug"
			:bodyMarkdown="post.body_markdown"
			:key="post.post_id"
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
			const urlQuery = new URLSearchParams();
			urlQuery.append("sort", "latest");

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts`, urlQuery)
				.then(response => {
					this.posts = response.data.posts;
				})
				.catch(error => {
					console.log(error);
				});
		}
	},
	mounted() {
		this.getPosts();
	}
};
</script>

<template>
	<div class="editpost">
		<l-text
			v-model="post.title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
		/>
		<l-textarea
			v-model="post.body_markdown"
			name="Post description"
			placeholder="What would you use it for?"
		/>
		<Button type="primary" @click.native="savePost">
			Update
		</Button>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import LText from "../../components/ui/input/LText";
import LTextarea from "../../components/ui/input/LTextarea";
import Button from "../../components/ui/Button";

export default {
	name: "PostEdit",
	data() {
		return {
			post: {}
		};
	},
	components: {
		LText,
		LTextarea,
		Button
	},
	methods: {
		loadPostData() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/post/${slug}`)
				.then(response => {
					this.post = response.data.post;
				})
				.catch(error => {
					console.log(error);
				});
		},
		savePost() {
			// get memberId and token from localStorage
			const token = localStorage.getItem("authToken");

			axios({
				method: "patch",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/post/update/${this.post.post_id}`,
				data: {
					title: this.post.title,
					bodyMarkdown: this.post.body_markdown,
					slugId: this.post.slug_id
				},
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
				.then(response => {
					this.post = response.data.post;

					// redirect to post view page
					this.$router.push(`/post/${this.post.slug}`);
				})
				.catch(error => {
					console.log(error);
				});
		}
	},
	mounted() {
		this.loadPostData();
	}
};
</script>

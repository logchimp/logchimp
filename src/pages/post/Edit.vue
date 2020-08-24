<template>
	<div class="editpost">
		<l-text
			v-model="post.title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
		/>
		<l-textarea
			v-model="post.contentMarkdown"
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
		getPost() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${slug}`)
				.then(response => {
					this.post = response.data.post;
				})
				.catch(error => {
					console.log(error);
				});
		},
		savePost() {
			const userId = this.$store.getters["user/getUserId"];

			if (this.post.userId === userId) {
				const token = this.$store.getters["user/getAuthToken"];

				axios({
					method: "patch",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${this.post.postId}`,
					data: {
						title: this.post.title,
						contentMarkdown: this.post.contentMarkdown,
						slugId: this.post.slugId,
						userId: this.post.userId
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
			} else {
				// show error alert 'insufficient_premissions'
			}
		}
	},
	created() {
		this.getPost();
	}
};
</script>

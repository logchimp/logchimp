<template>
	<div class="editpost">
		<l-text
			v-model="post.title"
			label="Title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
		/>
		<l-textarea
			v-model="post.contentMarkdown"
			label="Description"
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
					if (response.data.status.code === 200) {
						this.$store.dispatch("alerts/add", {
							title: "Updated",
							description: "The post have been updated successfully.",
							type: "success",
							timeout: 5000
						});

						this.post = response.data.post;
						this.$router.push(`/post/${this.post.slug}`);
					}
				})
				.catch(error => {
					const err = { ...error };

					if (err.response.data.error.code === "insufficient_premissions") {
						this.$store.dispatch("alerts/add", {
							title: "Insufficient premissions",
							description: "You're not allowed to edit this post.",
							type: "warning",
							timeout: 6000
						});
					}
				});
		}
	},
	created() {
		this.getPost();
	}
};
</script>

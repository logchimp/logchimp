<template>
	<div class="editpost">
		<l-text
			v-model="title.value"
			label="Title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
			:error="title.error"
			@keydown.native="titleHandler"
		/>
		<l-textarea
			v-model="contentMarkdown"
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
			title: {
				value: "",
				error: {
					show: false,
					message: "Required"
				}
			},
			contentMarkdown: "",
			postId: "",
			slugId: "",
			userId: "",
			slug: ""
		};
	},
	components: {
		LText,
		LTextarea,
		Button
	},
	methods: {
		titleHandler() {
			this.title.error.show = false;
		},
		getPost() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${slug}`)
				.then(response => {
					this.title.value = response.data.post.title;
					this.contentMarkdown = response.data.post.contentMarkdown;
					this.postId = response.data.post.postId;
					this.slugId = response.data.post.slugId;
					this.userId = response.data.post.userId;
				})
				.catch(error => {
					console.log(error);
				});
		},
		savePost() {
			if (this.title.value) {
				const token = this.$store.getters["user/getAuthToken"];

				axios({
					method: "patch",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${this.postId}`,
					data: {
						title: this.title.value,
						contentMarkdown: this.contentMarkdown,
						slugId: this.slugId,
						userId: this.userId
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

							this.title.value = response.data.post.title;
							this.contentMarkdown = response.data.post.contentMarkdown;
							this.slugId = response.data.post.slugId;
							this.userId = response.data.post.userId;
							this.slug = response.data.post.slug;

							this.$router.push(`/post/${this.slug}`);
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
			} else {
				this.title.error.show = true;
			}
		}
	},
	created() {
		this.getPost();
	}
};
</script>

<template>
	<Form>
		<h4 class="post-edit-heading">Edit post</h4>
		<div v-if="!post.loading">
			<l-text
				v-model="post.title.value"
				label="Title"
				type="text"
				name="Post title"
				placeholder="Name of the feature"
				:error="post.title.error"
				@keydown.native="titleHandler"
				@keyup.native.enter="savePost"
			/>
			<l-textarea
				v-model="post.contentMarkdown"
				label="Description"
				name="Post description"
				placeholder="What would you use it for?"
			/>
			<div style="display: flex;">
				<Button type="primary" @click="savePost" :loading="buttonLoading">
					Update
				</Button>
			</div>
		</div>
		<div v-else class="loader-container">
			<loader />
		</div>
	</Form>
</template>

<script>
// packages
import axios from "axios";

// components
import Form from "../../components/Form";
import Loader from "../../components/Loader";
import LText from "../../components/input/LText";
import LTextarea from "../../components/input/LTextarea";
import Button from "../../components/Button";

export default {
	name: "PostEdit",
	data() {
		return {
			post: {
				loading: false,
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
			},
			buttonLoading: false
		};
	},
	components: {
		// components
		Form,
		Loader,
		LText,
		LTextarea,
		Button
	},
	methods: {
		titleHandler() {
			this.post.title.error.show = false;
		},
		getPost() {
			this.post.loading = true;
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${slug}`)
				.then(response => {
					this.post.title.value = response.data.post.title;
					this.post.contentMarkdown = response.data.post.contentMarkdown;
					this.post.postId = response.data.post.postId;
					this.post.slugId = response.data.post.slugId;
					this.post.userId = response.data.post.userId;
					this.post.loading = false;
				})
				.catch(error => {
					this.post.loading = false;
					console.error(error);
				});
		},
		savePost() {
			if (this.post.title.value) {
				this.buttonLoading = true;
				const token = this.$store.getters["user/getAuthToken"];

				axios({
					method: "patch",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${this.post.postId}`,
					data: {
						title: this.post.title.value,
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

							this.post.title.value = response.data.post.title;
							this.post.contentMarkdown = response.data.post.contentMarkdown;
							this.post.slugId = response.data.post.slugId;
							this.post.userId = response.data.post.userId;
							this.post.slug = response.data.post.slug;

							this.buttonLoading = false;
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
			} else {
				this.post.title.error.show = true;
			}
		}
	},
	created() {
		this.getPost();
	}
};
</script>

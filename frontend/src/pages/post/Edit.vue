<template>
	<Form v-if="isPostExist">
		<h4 class="post-edit-heading">Edit post</h4>
		<div v-if="!post.loading">
			<l-text
				v-model="post.title.value"
				label="Title"
				type="text"
				name="Post title"
				placeholder="Name of the feature"
				:error="post.title.error"
				@keyup-enter="savePost"
				@hide-error="hideTitleError"
			/>
			<l-textarea
				v-model="post.contentMarkdown"
				label="Description"
				name="Post description"
				placeholder="What would you use it for?"
			/>
			<div style="display: flex; justify-content: flex-start;">
				<Button type="primary" @click="savePost" :loading="buttonLoading">
					Update
				</Button>
			</div>
		</div>
		<div v-else class="loader-container">
			<loader />
		</div>
	</Form>
	<p v-else>
		There is no such post.
	</p>
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
			isPostExist: true,
			post: {
				loading: false,
				title: {
					value: "",
					error: {
						show: false,
						message: ""
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
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		hideTitleError(event) {
			this.post.title.error = event;
		},
		getPost() {
			this.post.loading = true;
			const slug = this.$route.params.slug;

			axios
				.get(`/api/v1/posts/${slug}`)
				.then(response => {
					this.post.title.value = response.data.post.title;
					this.post.contentMarkdown = response.data.post.contentMarkdown;
					this.post.postId = response.data.post.postId;
					this.post.slugId = response.data.post.slugId;
					this.post.userId = response.data.post.userId;
					this.post.loading = false;
				})
				.catch(error => {
					if (error.response.data.code === "POST_NOT_FOUND") {
						this.isPostExist = false;
					}

					this.post.loading = false;
				});
		},
		savePost() {
			if (this.buttonLoading) {
				return;
			}
			if (this.post.title.value) {
				this.buttonLoading = true;
				const token = this.$store.getters["user/getAuthToken"];

				axios({
					method: "patch",
					url: `/api/v1/posts/${this.post.postId}`,
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
						if (error.response.data.code === "NOT_ENOUGH_PERMISSION") {
							const slug = this.$route.params.slug;
							this.$router.push(`/post/${slug}`);
						}

						this.buttonLoading = false;
					});
			} else {
				this.post.title.error.show = true;
				this.post.title.error.message = "Required";
			}
		}
	},
	created() {
		this.getPost();
	},
	metaInfo() {
		return {
			title: "Edit post",
			meta: [
				{
					name: "og:title",
					content: `Edit post · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

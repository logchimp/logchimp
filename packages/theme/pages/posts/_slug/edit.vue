<template>
	<div>
		<h4 class="post-edit-heading">Edit post</h4>
		<l-text
			v-model="post.title"
			label="Title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
			:error="error.title"
			:disabled="updatePostPermissionDisabled"
			@keyup-enter="savePost"
			@hide-error="hideTitleError"
		/>
		<l-textarea
			v-model="post.contentMarkdown"
			label="Description"
			name="Post description"
			placeholder="What would you use it for?"
			:disabled="updatePostPermissionDisabled"
		/>
		<div style="display: flex; justify-content: flex-start">
			<Button
				type="primary"
				:loading="buttonLoading"
				:disabled="updatePostPermissionDisabled"
				@click="savePost"
			>
				Update
			</Button>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";

// components
import Loader from "../../../components/ui/Loader.vue";
import LText from "../../../components/ui/LText.vue";
import LTextarea from "../../../components/ui/LTextarea.vue";
import Button from "../../../components/ui/Button.vue";

export default {
	name: "PostEdit",
	layout: "viewer",
	components: {
		// components
		Loader,
		LText,
		LTextarea,
		Button
	},
	data() {
		return {
			error: {
				title: {
					show: false,
					message: ""
				}
			},
			buttonLoading: false
		};
	},
	async asyncData({ route, $axios, error, store }) {
		const userId = store.getters["user/getUserId"];
		const slug = route.params.slug;

		try {
			const response = await $axios({
				method: "POST",
				url: "/api/v1/posts/slug",
				data: {
					slug,
					userId
				}
			});

			return {
				post: response.data.post
			};
		} catch (err) {
			error({
				code: err.response.data.code,
				...(err.response.data.code === "POST_NOT_FOUND" && {
					notFound: err.response.data.code === "POST_NOT_FOUND"
				})
			});
		}
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		updatePostPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("post:update");
			const userId = this.$store.getters["user/getUserId"];
			const authorId = this.post.author.userId;
			if (!checkPermission && userId !== authorId) return true;
			return false;
		}
	},
	methods: {
		hideTitleError(event) {
			this.error.title = event;
		},
		async savePost() {
			if (!this.post.title) {
				this.error.title.show = true;
				this.error.title.message = "Please enter a valid post title";
				return;
			}

			this.buttonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "PATCH",
					url: "/api/v1/posts",
					data: {
						id: this.post.postId,
						title: this.post.title,
						contentMarkdown: this.post.contentMarkdown
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.$router.push(`/posts/${response.data.post.slug}`);
			} catch (error) {
				this.buttonLoading = false;

				console.log(error);
			}
		}
	},
	head() {
		return {
			title: `Edit post • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Edit post • ${this.settings.title}`
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.post-edit-heading
	margin-bottom: 2rem
</style>

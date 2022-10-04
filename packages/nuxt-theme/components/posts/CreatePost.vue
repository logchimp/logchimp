<template>
	<div class="card">
		<l-text
			v-model="title.value"
			label="Title"
			type="text"
			name="Post title"
			data-test="post-title"
			placeholder="Name of the feature"
			:error="title.error"
			:disabled="createPostPermissionDisabled"
			@keyup-enter="submitPost"
			@hide-error="hideTitleError"
		/>
		<l-textarea
			v-model="description.value"
			label="Description"
			rows="4"
			name="Post description"
			placeholder="What would you use it for?"
			:disabled="createPostPermissionDisabled"
		/>
		<div style="display: flex; justify-content: center">
			<Button
				type="primary"
				data-test="create-post-button"
				:loading="buttonLoading"
				:disabled="createPostPermissionDisabled"
				@click="submitPost"
			>
				Submit
			</Button>
		</div>
	</div>
</template>

<script>
// components
import LText from "../ui/LText.vue";
import LTextarea from "../ui/LTextarea.vue";
import Button from "../ui/Button.vue";

import { validateUUID } from "../../helpers/validateUUID";
import tokenError from "../../mixins/tokenError";

export default {
	name: "CreatePost",
	components: {
		// components
		LText,
		LTextarea,
		Button
	},
	mixins: [tokenError],
	props: {
		boardId: {
			type: String,
			required: true,
			validator: validateUUID
		},
		dashboard: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			title: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			description: {
				value: ""
			},
			buttonLoading: false
		};
	},
	computed: {
		dashboardUrl() {
			return this.dashboard ? "/dashboard" : "";
		},
		createPostPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("post:create");
			return !checkPermission;
		}
	},
	methods: {
		hideTitleError(event) {
			this.title.error = event;
		},
		async submitPost() {
			if (!this.title.value) {
				this.title.error.show = true;
				this.title.error.message = "You forgot to enter a post title";
				return;
			}

			this.buttonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];
				const userId = this.$store.getters["user/getUserId"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/posts",
					data: {
						title: this.title.value,
						contentMarkdown: this.description.value,
						userId,
						boardId: this.boardId
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				// redirect to post
				const slug = response.data.post.slug;
				this.$router.push({ path: `${this.dashboardUrl}/posts/${slug}` });
			} catch (error) {
				this.tokenError(error);
				this.buttonLoading = false;
			}
		}
	}
};
</script>

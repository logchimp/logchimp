<template>
	<Form>
		<l-text
			v-model="title.value"
			label="Title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
			:error="title.error"
			@keyup-enter="submitPost"
			@hide-error="hideTitleError"
		/>
		<l-textarea
			v-model="description.value"
			label="Description"
			rows="4"
			name="Post description"
			placeholder="What would you use it for?"
		/>
		<div style="display: flex; justify-content: center;">
			<Button type="primary" :loading="buttonLoading" @click="submitPost">
				Submit
			</Button>
		</div>
	</Form>
</template>

<script>
// modules
import { createPost } from "../../modules/posts";

// components
import Form from "../Form";
import LText from "../input/LText";
import LTextarea from "../input/LTextarea";
import Button from "../Button";

// mixins
import tokenErrorHandle from "../../mixins/tokenErrorHandle";

export default {
	name: "CreatePost",
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
	props: {
		boardId: {
			type: String,
			default: "",
			required: true
		},
		dashboard: {
			type: Boolean,
			default: false
		}
	},
	mixins: [tokenErrorHandle],
	components: {
		// components
		Form,
		LText,
		LTextarea,
		Button
	},
	computed: {
		dashboardUrl() {
			return this.dashboard ? "/dashboard" : "";
		}
	},
	methods: {
		hideTitleError(event) {
			this.title.error = event;
		},
		async submitPost() {
			if (this.buttonLoading) {
				return;
			}

			if (!this.title.value) {
				this.title.error.show = true;
				this.title.error.message = "Required";
				return;
			}

			this.buttonLoading = true;
			const postObject = {
				title: this.title.value,
				description: this.description.value
			};

			try {
				const response = await createPost(this.boardId, postObject);

				// redirect to post
				const slug = response.data.post.slug;
				this.$router.push({ path: `${this.dashboardUrl}/post/${slug}` });
			} catch (error) {
				this.userNotFound(error);
				this.invalidToken(error);
				this.invalidAuthHeaderFormat(error);
			} finally {
				this.buttonLoading = false;
			}
		}
	}
};
</script>

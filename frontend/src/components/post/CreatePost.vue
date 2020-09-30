<template>
	<Form>
		<l-text
			v-model="title.value"
			label="Title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
			:error="title.error"
			@keyup.native.enter="submitPost"
		/>
		<l-textarea
			v-model="description.value"
			label="Description"
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
// packages
import axios from "axios";

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
		submitPost() {
			if (this.title.value) {
				this.buttonLoading = true;
				const userId = this.$store.getters["user/getUserId"];
				const token = this.$store.getters["user/getAuthToken"];
				const boardId = this.boardId;

				axios({
					method: "post",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts`,
					data: {
						title: this.title.value,
						contentMarkdown: this.description.value,
						userId,
						boardId
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
					.then(response => {
						this.buttonLoading = false;

						// redirect to post
						const slug = response.data.post.slug;
						this.$router.push({ path: `${this.dashboardUrl}/post/${slug}` });
					})
					.catch(error => {
						this.userNotFound(error);
						this.invalidToken(error);

						this.buttonLoading = false;
					});
			} else {
				this.title.error.show = true;
				this.title.error.message = "Required";
			}
		}
	}
};
</script>

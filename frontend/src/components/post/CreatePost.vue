<template>
	<Form>
		<l-text
			v-model="title.value"
			label="Title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
			:error="title.error"
			@keydown.native="titleHandler"
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

export default {
	name: "CreatePost",
	data() {
		return {
			title: {
				value: "",
				error: {
					show: false,
					message: "Required"
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
		titleHandler() {
			this.title.error.show = false;
		},
		submitPost() {
			this.title.error.show = false;

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
						if (response.data.status.code === 201) {
							this.$store.dispatch("alerts/add", {
								title: "🎉 Feature posted",
								description: "You have successfully submitted feature request.",
								type: "success",
								timeout: 5000
							});

							this.buttonLoading = false;
							const slug = response.data.post.slug;
							this.$router.push({ path: `${this.dashboardUrl}/post/${slug}` });
						}
					})
					.catch(error => {
						this.buttonLoading = false;
						const err = { ...error };

						if (err.response.data.error.code === "token_missing") {
							this.$store.dispatch("alerts/add", {
								title: "Holy accounts!",
								description: "You need to login to submit feature request.",
								type: "error",
								timeout: 5000
							});
						}

						if (err.response.data.error.code === "token_invalid") {
							this.$store.dispatch("alerts/add", {
								title: "Hold on! ✋",
								description: "You're not authorized to submit feature request.",
								type: "error",
								timeout: 5000
							});
						}
					});
			} else {
				this.title.error.show = true;
			}
		}
	}
};
</script>

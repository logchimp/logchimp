<template>
	<div class="createpost">
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
		<Button type="primary" @click.native="submitPost">
			Submit
		</Button>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import LText from "../ui/input/LText";
import LTextarea from "../ui/input/LTextarea";
import Button from "../ui/Button";

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
			}
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
		submitPost() {
			this.title.error.show = false;

			if (this.title.value) {
				const userId = this.$store.getters["user/getUserId"];
				const token = this.$store.getters["user/getAuthToken"];
				axios({
					method: "post",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts`,
					data: {
						title: this.title.value,
						contentMarkdown: this.description.value,
						userId
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

							const slug = response.data.post.slug;
							this.$router.push({ path: `post/${slug}` });
						}
					})
					.catch(error => {
						const err = { ...error };

						if (err.response.data.error.code === "token_invalid") {
							this.$store.dispatch("alerts/add", {
								title: "Hold on! ✋",
								description: "You need to login to submit feature request.",
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

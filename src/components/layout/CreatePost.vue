<template>
	<div class="createpost">
		<l-text
			v-model="title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
		/>
		<l-textarea
			v-model="bodyMarkdown"
			name="Post description"
			placeholder="What would you use it for?"
		/>
		<l-primary-button @click.native="submitPost">
			Submit
		</l-primary-button>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import LText from "../ui/input/LText";
import LTextarea from "../ui/input/LTextarea";
import LPrimaryButton from "../ui/button/LPrimaryButton";

export default {
	name: "CreatePost",
	data() {
		return {
			title: "",
			bodyMarkdown: ""
		};
	},
	components: {
		LText,
		LTextarea,
		LPrimaryButton
	},
	methods: {
		submitPost() {
			// get memberId and token from localStorage
			const memberId = localStorage.getItem("memberId");
			const token = localStorage.getItem("authToken");

			axios({
				method: "post",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/post/create`,
				data: {
					title: this.title,
					bodyMarkdown: this.bodyMarkdown,
					memberId
				},
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
				.then(response => {
					const postSlug = response.data.post.slug;
					this.$router.push({ path: `post/${postSlug}` });
				})
				.catch(error => {
					console.log(error);
				});
		}
	}
};
</script>

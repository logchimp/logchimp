<template>
	<div class="createpost">
		<l-text
			v-model="title"
			type="text"
			name="Post title"
			placeholder="Name of the feature"
		/>
		<l-textarea
			v-model="description"
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
			title: "",
			description: ""
		};
	},
	components: {
		LText,
		LTextarea,
		Button
	},
	methods: {
		submitPost() {
			const memberId = this.$store.getters["member/getMemberId"];
			const token = this.$store.getters["member/getAuthToken"];

			axios({
				method: "post",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/post/create`,
				data: {
					title: this.title,
					bodyMarkdown: this.description,
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

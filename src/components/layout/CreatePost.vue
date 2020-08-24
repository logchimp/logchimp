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
			const userId = this.$store.getters["user/getUserId"];
			const token = this.$store.getters["user/getAuthToken"];

			axios({
				method: "post",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/posts`,
				data: {
					title: this.title,
					contentMarkdown: this.description,
					userId
				},
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
				.then(response => {
					const slug = response.data.post.slug;
					this.$router.push({ path: `post/${slug}` });
				})
				.catch(error => {
					console.log(error);
				});
		}
	}
};
</script>

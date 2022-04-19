<template>
	<div class="card">
		<l-text
			v-model="value"
			name="comment"
			placeholder="Leave a comment"
			@keyup-enter="submitComment"
		/>

		<div style="display: flex; justify-content: flex-end">
			<Button
				type="primary"
				:loading="loading"
				:disabled="!value"
				@click="submitComment"
			>
				Submit
			</Button>
		</div>
	</div>
</template>

<script>
// components
import LText from "../ui/LText.vue";
import Button from "../ui/Button.vue";

export default {
	name: 'AddComment',
	data() {
		return {
			value: "",
			loading: false,
		}
	},
	props: {
		postId: {
			type: String,
			required: true,
		}
	},
	components: {
		// components
		LText,
		Button,
	},
	methods: {
		async submitComment() {
			if (!this.value) return;

			try {
				const token = this.$store.getters["user/getAuthToken"];
				const postId = this.postId;

				this.loading = true;

				const response = await this.$axios({
					method: "POST",
					url: `/api/v1/posts/${postId}/comments`,
					data: {
						body: this.value,
						is_internal: false
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.value = "";
				this.loading = false;

				this.$emit('add-comment', response.data.comment)
			} catch (error) {
				this.loading = false;

				// Is user not authenticated?
				if (error.response.data.code === "INVALID_AUTH_HEADER_FORMAT") {
					this.$router.push({
						path: '/login',
						query: {
							redirect: this.$router.currentRoute.fullPath
						}
					})
				}

				console.log(error);
			}
		},
	}
}
</script>

<style lang='sass'>

</style>

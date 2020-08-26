<template>
	<div class="post">
		<div class="post__voters" @click="changeVote">
			<arrow-icon
				class="post__voters-arrow"
				:class="{ 'post__voters-vote': isVoted }"
			/>
			{{ voteCount }}
		</div>
		<div class="post__content">
			<router-link class="post__content-link" :to="`post/${post.slug}`">
				<h5 class="post__content-title">{{ post.title }}</h5>
			</router-link>
			<p class="post__content-description" v-html="sliceContentMarkdown" />
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// icons
import ArrowIcon from "../../assets/images/icons/arrow";

export default {
	name: "post",
	components: {
		ArrowIcon
	},
	props: {
		post: {
			type: Object,
			required: true,
			default: () => {}
		}
	},
	computed: {
		voteCount() {
			return this.post.voters.length;
		},
		sliceContentMarkdown() {
			if (this.post.contentMarkdown) {
				return (
					this.post.contentMarkdown.slice(0, 120) +
					(this.post.contentMarkdown.length > 120 ? "..." : "")
				);
			} else {
				return "";
			}
		},
		isVoted() {
			const userId = this.$store.getters["user/getUserId"];
			return this.post.voters.find(item => {
				return item.userId === userId;
			});
		}
	},
	methods: {
		changeVote() {
			const userId = this.$store.getters["user/getUserId"];
			const postId = this.post.postId;
			const token = this.$store.getters["user/getAuthToken"];

			if (this.isVoted) {
				const voteId = this.post.voters.find(item => {
					return item.userId === userId;
				});

				axios({
					method: "delete",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/votes`,
					data: {
						voteId: voteId.voteId,
						postId
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
					.then(response => {
						this.post.voters = response.data.voters;
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
							this.$router.push("/login");
						}
					});
			}
		}
	}
};
</script>

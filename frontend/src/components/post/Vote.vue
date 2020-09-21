<template>
	<div class="post-voters" @click="changeVote">
		<arrow-icon
			class="post-voters-arrow"
			:class="{ 'post-voters-vote': isVoted }"
		/>
		{{ voteCount }}
	</div>
</template>

<script>
// packages
import axios from "axios";

// icons
import ArrowIcon from "../icons/Arrow";

export default {
	name: "Vote",
	components: {
		ArrowIcon
	},
	props: {
		postId: {
			type: String,
			required: true,
			default: ""
		},
		voters: {
			type: Array,
			required: true,
			default: () => []
		}
	},
	computed: {
		voteCount() {
			return this.voters.length;
		},
		isVoted() {
			const userId = this.$store.getters["user/getUserId"];
			return this.voters.find(item => {
				return item.userId === userId;
			});
		}
	},
	methods: {
		changeVote() {
			const userId = this.$store.getters["user/getUserId"];
			const postId = this.postId;
			const token = this.$store.getters["user/getAuthToken"];

			if (this.isVoted) {
				const voteId = this.voters.find(item => {
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
						// this.voters = response.data.voters;
						this.$emit("update-voters", response.data.voters);
					})
					.catch(error => {
						const err = { ...error };

						if (err.response.data.error.code === "token_missing") {
							this.$store.dispatch("alerts/add", {
								title: "Holy accounts!",
								type: "error",
								timeout: 5000
							});
							this.$router.push("/login");
						}

						if (err.response.data.error.code === "token_invalid") {
							this.$store.dispatch("alerts/add", {
								title: "Hold on! ✋",
								type: "error",
								timeout: 5000
							});
						}
					});
			} else {
				axios({
					method: "post",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/votes`,
					data: {
						userId,
						postId
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
					.then(response => {
						// this.voters = response.data.voters;
						this.$emit("update-voters", response.data.voters);
					})
					.catch(error => {
						const err = { ...error };

						if (err.response.data.error.code === "token_missing") {
							this.$store.dispatch("alerts/add", {
								title: "Holy accounts!",
								type: "error",
								timeout: 5000
							});
							this.$router.push("/join");
						}

						if (err.response.data.error.code === "token_invalid") {
							this.$store.dispatch("alerts/add", {
								title: "Hold on! ✋",
								type: "error",
								timeout: 5000
							});
						}
					});
			}
		}
	}
};
</script>

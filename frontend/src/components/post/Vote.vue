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

// mixins
import tokenErrorHandle from "../../mixins/tokenErrorHandle";

export default {
	name: "Vote",
	data() {
		return {
			loading: false
		};
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
	components: {
		ArrowIcon
	},
	mixins: [tokenErrorHandle],
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
			if (this.loading) {
				return;
			}
			const userId = this.$store.getters["user/getUserId"];
			const postId = this.postId;
			const token = this.$store.getters["user/getAuthToken"];
			this.loading = true;

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
						this.$emit("update-voters", response.data.voters);

						this.loading = false;
					})
					.catch(error => {
						this.userNotFound(error);
						this.invalidToken(error);
						this.invalidAuthHeaderFormat(error);

						this.loading = false;
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
						this.$emit("update-voters", response.data.voters);

						this.loading = false;
					})
					.catch(error => {
						this.userNotFound(error);
						this.invalidToken(error);
						this.invalidAuthHeaderFormat(error);

						this.loading = false;
					});
			}
		}
	}
};
</script>

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
// modules
import { addVote, deleteVote } from "../../modules/votes";

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
		async changeVote() {
			if (this.loading) {
				return;
			}

			const userId = this.$store.getters["user/getUserId"];
			this.loading = true;

			if (this.isVoted) {
				const userVote = this.voters.find(item => {
					return item.userId === userId;
				});

				try {
					const response = await deleteVote(this.postId);

					this.$emit("update-voters", response.data.voters);
				} catch (error) {
					this.userNotFound(error);
					this.invalidToken(error);
					this.invalidAuthHeaderFormat(error);
				} finally {
					this.loading = false;
				}
			} else {
				try {
					const response = await addVote(this.postId);

					this.$emit("update-voters", response.data.voters);
				} catch (error) {
					this.userNotFound(error);
					this.invalidToken(error);
					this.invalidAuthHeaderFormat(error);
				} finally {
					this.loading = false;
				}
			}
		}
	}
};
</script>

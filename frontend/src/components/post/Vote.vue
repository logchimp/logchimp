<template>
	<div class="post-voters" @click="changeVote">
		<arrow-icon
			class="post-voters-arrow"
			:class="{ 'post-voters-vote': isVoted }"
		/>
		{{ votesCount }}
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
			required: true
		},
		votesCount: {
			type: Number,
			default: 0
		},
		isVoted: {
			type: Boolean,
			default: false
		}
	},
	components: {
		ArrowIcon
	},
	mixins: [tokenErrorHandle],
	methods: {
		async changeVote() {
			if (this.loading) {
				return;
			}

			this.loading = true;

			if (this.isVoted) {
				try {
					const response = await deleteVote(this.postId, userVote.voteId);

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

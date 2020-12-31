<template>
	<div
		class="post-voters"
		data-test="vote"
		@click="changeVote"
		:class="[disabled ? 'post-voters-disabled' : '']"
	>
		<arrow-icon
			class="post-voters-arrow"
			data-test="vote-arrow"
			:class="{ 'post-voters-vote': isVoted }"
		/>
		<span data-test="vote-count">{{ votesCount }}</span>
	</div>
</template>

<script>
// modules
import { addVote, deleteVote } from "../../modules/votes";

// icons
import ArrowIcon from "../icons/Arrow";

// mixins
import validateUUID from "../../utils/validateUUID";
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
			validator: validateUUID
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
	computed: {
		disabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const changeVotePermission = permissions.find(
				item => item === "vote:create"
			);

			return !changeVotePermission;
		}
	},
	methods: {
		async changeVote() {
			if (this.loading) return;
			if (this.disabled) return;

			this.loading = true;

			if (this.isVoted) {
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

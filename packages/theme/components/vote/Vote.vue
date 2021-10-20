<template>
	<div
		class="post-voters"
		data-test="vote"
		:class="{
			'post-voters-loading': loading,
			'post-voters-disabled': disabled
		}"
		@click="changeVote"
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
// icons
import ArrowIcon from "../icons/Arrow";

import tokenError from "../../mixins/tokenError";
import { validateUUID } from "../../helpers/validateUUID";

export default {
	name: "Vote",
	components: {
		ArrowIcon
	},
	mixins: [tokenError],
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
	data() {
		return {
			loading: false
		};
	},
	computed: {
		disabled() {
			const getUserId = this.$store.getters["user/getUserId"];
			if (!getUserId) return false;

			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("vote:create");
			return !checkPermission;
		}
	},
	methods: {
		async changeVote() {
			if (this.loading || this.disabled) return;

			this.loading = true;

			if (this.isVoted) {
				try {
					const token = this.$store.getters["user/getAuthToken"];
					const userId = this.$store.getters["user/getUserId"];

					const response = await this.$axios({
						method: "DELETE",
						url: "/api/v1/votes",
						data: {
							userId,
							postId: this.postId
						},
						headers: {
							Authorization: `Bearer ${token}`
						}
					});

					this.$emit("update-voters", response.data.voters);
					this.loading = false;
				} catch (error) {
					this.tokenError(error);
					this.loading = false;
				}
			} else {
				try {
					const token = this.$store.getters["user/getAuthToken"];
					const userId = this.$store.getters["user/getUserId"];

					const response = await this.$axios({
						method: "POST",
						url: "/api/v1/votes",
						data: {
							userId,
							postId: this.postId
						},
						headers: {
							Authorization: `Bearer ${token}`
						}
					});

					this.$emit("update-voters", response.data.voters);
					this.loading = false;
				} catch (error) {
					this.tokenError(error);
					this.loading = false;
				}
			}
		}
	}
};
</script>

<style lang='sass'>
.post-voters
	margin-right: 1rem
	display: flex
	flex-direction: column
	align-items: center
	padding: 0.312rem 0.5rem 0.5rem
	border: 1px solid var(--color-gray-90)
	border-radius: var(--border-radius-default)
	cursor: pointer
	user-select: none

	&:hover
		border-color: var(--color-gray-80)

.post-voters-arrow
	margin-bottom: 0.185rem
	fill: var(--color-gray-90)

.post-voters-vote
	fill: var(--color-brand-color)

.post-voters-loading
	opacity: 0.8
	cursor: wait

.post-voters-disabled
	background-color: var(--color-gray-95)
	border-color: var(--color-gray-95)
	cursor: default
	opacity: 0.7

	&:hover
		border-color: var(--color-gray-95)

	.post-voters-arrow
		fill: var(--color-gray-80)
</style>

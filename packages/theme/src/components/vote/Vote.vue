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

<script lang="ts">
interface UserVoteType {
	voteId: string
	userId: string
	postId: string
	createdAt: string
	name?: string
	username?: string
	avatar?: string
}

export interface VoteEventType {
	votes: UserVoteType[]
	votesCount: number
	viewerVote: boolean
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";

// modules
import { addVote, deleteVote } from "../../modules/votes";
import { useUserStore } from "../../store/user"

// components
import ArrowIcon from "../icons/Arrow.vue";

// utils
import validateUUID from "../../utils/validateUUID";
import tokenError from "../../utils/tokenError";

const props = defineProps({
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
})

const emit = defineEmits<{
	(e: 'update-voters', voters: VoteEventType): void
}>()

const loading = ref<boolean>(false);
const userStore = useUserStore()

const disabled = computed(() => {
	if (!userStore.getUserId) return false;

	const checkPermission = userStore.permissions.includes("vote:create");
	return !checkPermission;
})

async function changeVote() {
	if (loading.value || disabled.value) return;


	loading.value = true;

	if (props.isVoted) {
		try {
			const response = await deleteVote(props.postId);

			emit("update-voters", response.data.voters);
			loading.value = false;
		} catch (error) {
			tokenError(error);
			loading.value = false;
		}
	} else {
		try {
			const response = await addVote(props.postId);

			emit("update-voters", response.data.voters);
			loading.value = false;
		} catch (error) {
			tokenError(error);
			loading.value = false;
		}
	}
}
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

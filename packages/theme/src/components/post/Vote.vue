<template>
  <div
    class="post-voters"
    data-test="vote"
    :class="[
      loading ? 'post-voters-loading' : '',
      disabled ? 'post-voters-disabled' : ''
    ]"
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
const { getUserId, permissions } = useUserStore()

const disabled = computed(() => {
	if (!getUserId) return false;

	const checkPermission = permissions.includes("vote:create");
	return !checkPermission;
})

async function changeVote() {
	if (loading.value) return;
	if (disabled.value) return;

	loading.value = true;

	if (props.isVoted) {
		try {
			const response = await deleteVote(props.postId);

			emit("update-voters", response.data.voters);
		} catch (error) {
			tokenError(error);
		} finally {
			loading.value = false;
		}
	} else {
		try {
			const response = await addVote(props.postId);

			emit("update-voters", response.data.voters);
		} catch (error) {
			tokenError(error);
		} finally {
			loading.value = false;
		}
	}
}
</script>

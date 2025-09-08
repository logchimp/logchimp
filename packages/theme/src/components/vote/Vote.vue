<template>
	<button
		data-test="vote"
		:class="[
      'group flex flex-col items-center select-none rounded-md pt-[5px] px-2 pb-2',
      'border border-(--color-gray-90) hover:border-(--color-gray-80) cursor-pointer',
      // loading
			loading && 'opacity-80 cursor-wait',
      // disabled
      'disabled:bg-(--color-gray-95) disabled:border-(--color-gray-95)',
      'disabled:cursor-default disabled:opacity-70',
      // look into these styles
      'mr-4'
		]"
		@click="changeVote"
    type="button"
    :aria-disabled="disabled ? 'true' : undefined"
    :disabled="disabled ? 'true' : undefined"
	>
		<arrow-icon
			data-test="vote-arrow"
			:class="[
        'mb-[3px] group-disabled:fill-(--color-gray-80)',
        isVoted ? 'fill-(--color-brand-color)' : 'fill-(--color-gray-90)'
      ]"
		/>
		<span data-test="vote-count">{{ votesCount }}</span>
	</button>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { IPostVote } from "@logchimp/types";

// modules
import { addVote, deleteVote } from "../../modules/votes";
import { useUserStore } from "../../store/user";

// components
import ArrowIcon from "../icons/Arrow.vue";

// utils
import validateUUID from "../../utils/validateUUID";
import tokenError from "../../utils/tokenError";

const props = defineProps({
  postId: {
    type: String,
    required: true,
    validator: validateUUID,
  },
  votesCount: {
    type: Number,
    default: 0,
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<(e: "update-voters", voters: IPostVote) => void>();

const loading = ref<boolean>(false);
const userStore = useUserStore();

const disabled = computed(() => {
  if (!userStore.getUserId) return false;

  const checkPermission = userStore.permissions.includes("vote:create");
  return !checkPermission;
});

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

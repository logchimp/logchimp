<template>
  <Dialog :open="open" @update:open="e => $emit('close', e)">
    <template #title>Delete Comment</template>

    <template #description>
      <div class="gap-y-2">
        <p>
          Are you sure you want to delete this comment? This action cannot be undone.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 select-none"
          @click="() => $emit('close', false)"
        >
          Cancel
        </button>
        <button
          :class="[
            'px-3 py-2 text-sm rounded-md bg-red-600 text-white select-none',
            'not-disabled:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed'
          ]"
          @click="deleteHandler"
          :disabled="loading"
        >
          {{ loading ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IPostActivity } from "@logchimp/types";

import { deleteComment } from "../../modules/posts";
import { usePostActivityEEStore } from "../../store/postActivity";

import Dialog from "../../../components/ui/Dialog/Dialog.vue";

const postActivityEEStore = usePostActivityEEStore();

interface Props {
  open: boolean;
  postId: string;
  activity: IPostActivity;
}
const props = defineProps<Props>();
const emit = defineEmits<(e: "close", value: boolean) => void>();
const loading = ref<boolean>(false);

async function deleteHandler() {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await deleteComment(
      props.postId,
      props.activity.comment.id,
    );

    if (response.status === 204) {
      postActivityEEStore.removePostActivity(props.postId, props.activity.id);
      emit("close", false);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>
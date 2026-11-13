<template>
  <Dialog :open="open" @update:open="(e) => $emit('close', e)">
    <template #title>Delete Comment</template>

    <template #description>
      <div class="gap-y-2">
        <p>
          Are you sure you want to delete this comment? This action cannot be
          undone.
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
            'not-disabled:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed',
          ]"
          :disabled="loading"
          @click="deleteHandler"
        >
          {{ loading ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { components } from "@logchimp/api-ts-types";
import type { AxiosError } from "axios";

import { PostsEE } from "../../modules/posts";
import { usePostActivityEEStore } from "../../store/postActivity";

import Dialog from "../../../components/ui/Dialog/Dialog.vue";
import { useAlertStore } from "../../../store/alert.ts";

const { add: alert } = useAlertStore();
const postActivityEEStore = usePostActivityEEStore();

interface Props {
  open: boolean;
  postId: string;
  activity: components["schemas"]["PostActivityItem"];
}
const props = defineProps<Props>();
const emit = defineEmits<(e: "close", value: boolean) => void>();
const loading = ref<boolean>(false);
const postsEEAPI = new PostsEE();

async function deleteHandler() {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await postsEEAPI.DeleteComment(
      props.postId,
      props.activity.comment.id,
    );

    if (response.status === 204) {
      postActivityEEStore.removePostActivity(props.postId, props.activity.id);
      emit("close", false);
    }
  } catch (error) {
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    alert({
      title: err.response?.data.message ?? "Failed to delete comment",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

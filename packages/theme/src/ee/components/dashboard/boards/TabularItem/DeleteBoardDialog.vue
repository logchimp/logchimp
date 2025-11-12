<template>
  <Dialog :open="open" @update:open="e => $emit('close', e)">
    <template #title>Delete Board</template>

    <template #description>
      <div class="space-y-1">
        <p>
          Are you sure you want to delete this board? This action cannot be undone.
        </p>

        <p>Posts linked to this board won’t be deleted, but they’ll be unassigned from it.</p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-600 hover:bg-gray-100 select-none"
          @click="() => $emit('close', false)"
        >
          Cancel
        </button>
        <button
          :class="[
            'px-3 py-2 text-sm rounded-md bg-red-600 text-white select-none',
            'not-disabled:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed'
          ]"
          @click="deleteBoardHandler"
          :disabled="loading"
        >
          {{ loading ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";

import { boardKey } from "./options";
import { deleteBoard } from "../../../../modules/boards";
import { useDashboardBoards } from "../../../../store/dashboard/boards";
import Dialog from "../../../../../components/ui/Dialog/Dialog.vue";

const board = inject(boardKey);
const dashboardBoards = useDashboardBoards();

interface Props {
  open: boolean;
}
defineProps<Props>();
const emit = defineEmits<(e: "close", value: boolean) => void>();
const loading = ref<boolean>(false);

async function deleteBoardHandler() {
  if (!board) return;

  if (loading.value) return;
  loading.value = true;

  try {
    const response = await deleteBoard(board.boardId);

    if (response.status === 204) {
      dashboardBoards.removeBoard(board.boardId);
      emit("close", false);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>

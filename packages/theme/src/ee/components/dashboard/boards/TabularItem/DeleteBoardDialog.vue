<template>
  <Dialog :open="open" @update:open="e => $emit('close', e)">
    <template #title>Delete Board</template>

    <template #description>
      Are you sure you want to delete this board? This action cannot be undone.
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-600 hover:bg-gray-100"
          @click="() => $emit('close', false)"
        >
          Cancel
        </button>
        <button
          class="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-800"
          @click="deleteBoardHandler"
        >
          Delete
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { inject } from "vue";

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

async function deleteBoardHandler() {
  if (!board) return;
  try {
    const response = await deleteBoard(board.boardId);

    if (response.status === 204) {
      dashboardBoards.removeBoard(board.boardId);
      emit("close", false);
    }
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <DropdownV2Content
    align="end"
    side="bottom"
    :loop="true"
  >
    <dropdown-item
      @click="router.push(`/dashboard/boards/${board?.url}/settings`)"
      :disabled="!board"
    >
      <template #icon>
        <settings-icon aria-hidden="true" />
      </template>
      Settings
    </dropdown-item>
    <dropdown-item
      v-if="settings.developer_mode"
      @click="board ? useCopyText(board?.boardId) : undefined"
      :disabled="!board"
    >
      <template #icon>
        <copy-icon aria-hidden="true" />
      </template>
      Copy ID
    </dropdown-item>
    <dropdown-separator />
    <dropdown-item
      :disabled="deleteBoardPermissionDisabled"
      variant="danger"
      @click="openConfirmDialog = true"
    >
      <template #icon>
        <delete-icon aria-hidden="true" />
      </template>
      Delete
    </dropdown-item>
  </DropdownV2Content>

  <Dialog v-model:open="openConfirmDialog">
    <template #title>Delete Board</template>

    <template #description>
      Are you sure you want to delete this board? This action cannot be undone.
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-600 hover:bg-gray-100"
          @click="openConfirmDialog = false"
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
import { computed, inject, ref } from "vue";
import {
  Clipboard as CopyIcon,
  Settings as SettingsIcon,
  Trash2 as DeleteIcon,
} from "lucide-vue";

import { boardKey } from "./options";
import { router } from "../../../../../router";
import { useCopyText } from "../../../../../hooks";
import { useUserStore } from "../../../../../store/user";
import { useSettingStore } from "../../../../../store/settings";
import { useDashboardBoards } from "../../../../store/dashboard/boards";
import { deleteBoard } from "../../../../modules/boards";

import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import DropdownSeparator from "../../../../../components/ui/DropdownV2/DropdownSeparator.vue";
import Dialog from "../../../../../components/ui/Dialog/Dialog.vue";

const board = inject(boardKey);
const { settings } = useSettingStore();
const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

const deleteBoardPermissionDisabled = computed(() => {
  if (!board) return true;
  const checkPermission = permissions.includes("board:destroy");
  return !checkPermission;
});

const openConfirmDialog = ref(false);

async function deleteBoardHandler() {
  if (!board) return;
  try {
    const response = await deleteBoard(board.boardId);

    if (response.status === 204) {
      dashboardBoards.removeBoard(board.boardId);
    }
  } catch (error) {
    console.error(error);
  }
}

defineOptions({
  name: "DashboardBoardsTabularItemMoreOptionsDropdownContent",
});
</script>
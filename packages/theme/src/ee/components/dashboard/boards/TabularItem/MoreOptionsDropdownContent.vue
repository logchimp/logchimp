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

  <DeleteBoardDialog
    :open="openConfirmDialog"
    @close="(e) => openConfirmDialog = e"
  />
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent, inject } from "vue";
import {
  Clipboard as CopyIcon,
  Settings as SettingsIcon,
  Trash2 as DeleteIcon,
} from "lucide-vue";

import { boardKey } from "./options";
import { router } from "../../../../../router";
import { useCopyText } from "../../../../../hooks";
import { useSettingStore } from "../../../../../store/settings";
import { useUserStore } from "../../../../../store/user";

import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import DropdownSeparator from "../../../../../components/ui/DropdownV2/DropdownSeparator.vue";
const DeleteBoardDialog = defineAsyncComponent(
  () => import("./DeleteBoardDialog.vue"),
);

const board = inject(boardKey);
const { settings } = useSettingStore();
const { permissions } = useUserStore();

const openConfirmDialog = ref(false);

const deleteBoardPermissionDisabled = computed(() => {
  if (!board) return true;
  const checkPermission = permissions.includes("board:destroy");
  return !checkPermission;
});

defineOptions({
  name: "DashboardBoardsTabularItemMoreOptionsDropdownContent",
});
</script>
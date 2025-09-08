<template>
  <dropdown-v2>
    <template #trigger>
      <DropdownMenuTrigger
          class="table-data table-data-icon boards-table-icon-settings"
        >
          <more-icon aria-hidden="true" class="stroke-neutral-700 size-5" />
          <span class="sr-only">More options</span>
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="end"
      side="bottom"
      :loop="true"
    >
      <dropdown-item
        @click="router.push(`/dashboard/boards/${board.url}/settings`)"
      >
        <template #icon>
          <settings-icon aria-hidden="true" />
        </template>
        Settings
      </dropdown-item>
      <dropdown-item
        v-if="settings.developer_mode"
        @click="useCopyText(board.boardId)"
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
        @click="deleteBoardHandler(board.boardId)"
      >
        <template #icon>
          <delete-icon aria-hidden="true" />
        </template>
        Delete
      </dropdown-item>
    </DropdownV2Content>
  </dropdown-v2>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DropdownMenuTrigger } from "reka-ui";
import type { IBoardPrivate } from "@logchimp/types";
import {
  MoreHorizontal as MoreIcon,
  Clipboard as CopyIcon,
  Trash2 as DeleteIcon,
  Settings as SettingsIcon,
} from "lucide-vue";

import { router } from "../../../../router";
import { useCopyText } from "../../../../hooks";
import { useSettingStore } from "../../../../store/settings";
import { useUserStore } from "../../../../store/user";
import { deleteBoard } from "../../../modules/boards";

import DropdownV2 from "../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownSeparator from "../../../../components/ui/DropdownV2/DropdownSeparator.vue";
import DropdownV2Content from "../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../../../../components/ui/DropdownV2/DropdownItem.vue";
import { useDashboardBoards } from "../../../store/dashboard/boards";

const { settings } = useSettingStore();
const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

interface Props {
  board: IBoardPrivate;
}

defineProps<Props>();

const deleteBoardPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("board:destroy");
  return !checkPermission;
});

async function deleteBoardHandler(id: string) {
  try {
    const response = await deleteBoard(id);

    if (response.status === 204) {
      dashboardBoards.removeBoard(id);
    }
  } catch (error) {
    console.error(error);
  }
}

defineOptions({
  name: "DashboardBoardsTabularItemMoreOptionsDropdown",
});
</script>
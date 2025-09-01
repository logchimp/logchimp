<template>
  <div class="table-data flex-1">
    {{ role.name }}
  </div>
  <div class="table-icon-group boards-table-icons">
    <DropdownV2>
      <template #trigger>
        <DropdownMenuTrigger
          class="
            table-data table-data-icon
            boards-table-icon-settings
          "
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
        <DropdownItem
          v-if="settings.developer_mode"
          @click="router.push(`/dashboard/roadmaps/${role.id}/settings`)"
        >
          <template #icon>
            <settings-icon aria-hidden="true" />
          </template>
          Settings
        </DropdownItem>
        <DropdownItem
          v-if="settings.developer_mode"
          @click="useCopyText(role.id)"
        >
          <template #icon>
            <copy-icon aria-hidden="true" />
          </template>
          Copy ID
        </DropdownItem>
      </DropdownV2Content>
    </DropdownV2>
  </div>
</template>

<script setup lang="ts">
import {
  Settings as SettingsIcon,
  Clipboard as CopyIcon,
  MoreHorizontal as MoreIcon,
} from "lucide-vue";
import { DropdownMenuTrigger } from "reka-ui";
import type { IRole } from "@logchimp/types";

import { useCopyText } from "../../../../hooks";
import { useSettingStore } from "../../../../store/settings";
import { router } from "../../../../router";

import DropdownV2 from "../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownItem from "../../../../components/ui/DropdownV2/DropdownItem.vue";
import DropdownV2Content from "../../../../components/ui/DropdownV2/DropdownContent.vue";

const { settings } = useSettingStore();

interface Props {
  role: IRole;
}

defineProps<Props>();

defineOptions({
  name: "DashboardRolesTabularItem",
});
</script>
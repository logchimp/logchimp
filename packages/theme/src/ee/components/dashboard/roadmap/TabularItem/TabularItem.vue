<template>
  <div class="table-row">
    <div class="grip-handler table-data-icon px-5 py-4">
      <grip-icon />
    </div>
    <div class="table-data flex-1">
      {{ roadmap.name }}
    </div>
    <div class="table-icon-group boards-table-icons">
      <div class="table-data table-data-icon">
        <eye-icon v-if="roadmap.display" />
        <eye-off-icon v-else />
      </div>

      <DropdownV2>
        <template #trigger>
          <DropdownMenuTrigger
            class="table-data table-data-icon boards-table-icon-settings dropdown-menu-icon"
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
            @click="router.push(`/dashboard/roadmaps/${roadmap.url}/settings`)"
          >
            <template #icon>
              <settings-icon aria-hidden="true" />
            </template>
            Settings
          </DropdownItem>
          <DropdownItem
            v-if="settings.developer_mode"
            @click="useCopyText(roadmap.id)"
          >
            <template #icon>
              <copy-icon aria-hidden="true" />
            </template>
            Copy ID
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            :disabled="deleteRoadmapPermissionDisabled"
            variant="danger"
            @click="deleteRoadmapHandler(roadmap.id)"
          >
            <template #icon>
              <delete-icon aria-hidden="true" />
            </template>
            Delete
          </DropdownItem>
        </DropdownV2Content>
      </DropdownV2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Clipboard as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  GripVertical as GripIcon,
  MoreHorizontal as MoreIcon,
  Settings as SettingsIcon,
  Trash2 as DeleteIcon,
} from "lucide-vue";
import type { IRoadmapPrivate } from "@logchimp/types";
import { DropdownMenuTrigger } from "reka-ui";

import { router } from "../../../../../router";
import { useCopyText } from "../../../../../hooks";
import { useUserStore } from "../../../../../store/user";
import { deleteRoadmap } from "../../../../modules/roadmaps";
import { useSettingStore } from "../../../../../store/settings";
import { useDashboardRoadmaps } from "../../../../store/dashboard/roadmaps";

// components
import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import DropdownSeparator from "../../../../../components/ui/DropdownV2/DropdownSeparator.vue";
import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";

const { settings } = useSettingStore();
const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();

interface Props {
  roadmap: IRoadmapPrivate;
}

defineProps<Props>();

const deleteRoadmapPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("roadmap:destroy");
  return !checkPermission;
});

async function deleteRoadmapHandler(id: string) {
  try {
    const response = await deleteRoadmap({ id });

    if (response.status === 204) {
      dashboardRoadmaps.removeRoadmap(id);
    }
  } catch (error) {
    console.error(error);
  }
}

defineOptions({
  name: "DashboardRoadmapTabularItem",
});
</script>

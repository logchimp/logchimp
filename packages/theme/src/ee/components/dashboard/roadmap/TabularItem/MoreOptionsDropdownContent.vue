<template>
  <DropdownV2Content
    align="end"
    side="bottom"
    :loop="true"
  >
    <DropdownItem
      @click="router.push(`/dashboard/roadmaps/${roadmap?.url}/settings`)"
      :disable="!roadmap"
    >
      <template #icon>
        <settings-icon aria-hidden="true" />
      </template>
      Settings
    </DropdownItem>
    <DropdownItem
      v-if="settings.developer_mode"
      @click="roadmap?.id ? useCopyText(roadmap.id) : undefined"
      :disabled="!roadmap"
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
      @click="roadmap?.id ? deleteRoadmapHandler(roadmap.id) : undefined"
    >
      <template #icon>
        <delete-icon aria-hidden="true" />
      </template>
      Delete
    </DropdownItem>
  </DropdownV2Content>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import {
  Clipboard as CopyIcon,
  Settings as SettingsIcon,
  Trash2 as DeleteIcon,
} from "lucide-vue";

import { router } from "../../../../../router";
import { useCopyText } from "../../../../../hooks";
import { useSettingStore } from "../../../../../store/settings";
import { useUserStore } from "../../../../../store/user";
import { roadmapKey } from "./options";
import { deleteRoadmap } from "../../../../modules/roadmaps";
import { useDashboardRoadmaps } from "../../../../store/dashboard/roadmaps";

import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import DropdownSeparator from "../../../../../components/ui/DropdownV2/DropdownSeparator.vue";

const roadmap = inject(roadmapKey);
const { settings } = useSettingStore();
const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();

const deleteRoadmapPermissionDisabled = computed(() => {
  if (!roadmap) return true;
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
  name: "DashboardRoadmapTabularItemMoreOptionsDropdownContent",
});
</script>
<template>
  <DropdownV2Content
    align="end"
    side="bottom"
    :loop="true"
  >
    <DropdownItem
      @click="router.push(`/dashboard/roadmaps/${roadmap?.url}/settings`)"
      :disabled="!roadmap"
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
      @click="openConfirmDialog = true"
    >
      <template #icon>
        <delete-icon aria-hidden="true" />
      </template>
      Delete
    </DropdownItem>
  </DropdownV2Content>

  <Dialog v-model:open="openConfirmDialog">
    <template #title>Delete Roadmap</template>

    <template #description>
      Are you sure you want to delete this roadmap? This action cannot be undone.
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          @click="openConfirmDialog = false"
        >
          Cancel
        </button>
        <button
          class="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          @click="roadmap?.id ? deleteRoadmapHandler(roadmap.id) : undefined"
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
import Dialog from "../../../../../components/ui/Dialog/Dialog.vue";

const roadmap = inject(roadmapKey);
const { settings } = useSettingStore();
const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();

const deleteRoadmapPermissionDisabled = computed(() => {
  if (!roadmap) return true;
  const checkPermission = permissions.includes("roadmap:destroy");
  return !checkPermission;
});

const openConfirmDialog = ref(false);

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
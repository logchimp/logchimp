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

  <DeleteRoadmapDialog :open="openConfirmDialog" @close="(e) => openConfirmDialog = e" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, inject, ref } from "vue";
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

import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import DropdownSeparator from "../../../../../components/ui/DropdownV2/DropdownSeparator.vue";
const DeleteRoadmapDialog = defineAsyncComponent(
  () => import("./DeleteRoadmapDialog.vue"),
);

const roadmap = inject(roadmapKey);
const { settings } = useSettingStore();
const { permissions } = useUserStore();

const deleteRoadmapPermissionDisabled = computed(() => {
  if (!roadmap) return true;
  const checkPermission = permissions.includes("roadmap:destroy");
  return !checkPermission;
});

const openConfirmDialog = ref(false);

defineOptions({
  name: "DashboardRoadmapTabularItemMoreOptionsDropdownContent",
});
</script>
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
      <dropdown-wrapper>
        <template #toggle>
          <div
            class="table-data table-data-icon boards-table-icon-settings dropdown-menu-icon"
          >
            <more-icon />
          </div>
        </template>
        <template #default="dropdown">
          <dropdown v-if="dropdown.active">
            <dropdown-item
              @click="
								router.push(
									`/dashboard/roadmaps/${roadmap.url}/settings`
								)
							"
            >
              <template #icon>
                <settings-icon />
              </template>
              Settings
            </dropdown-item>
            <dropdown-item
              v-if="settings.developer_mode"
              @click="useCopyText(roadmap.id)"
            >
              <template #icon>
                <copy-icon />
              </template>
              Copy ID
            </dropdown-item>
            <dropdown-spacer />
            <dropdown-item
              :disabled="deleteRoadmapPermissionDisabled"
              class="color-danger"
              @click="deleteRoadmapHandler(roadmap.id)"
            >
              <template #icon>
                <delete-icon />
              </template>
              Delete
            </dropdown-item>
          </dropdown>
        </template>
      </dropdown-wrapper>
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
  Trash2 as DeleteIcon
} from "lucide-vue";
import type { IRoadmapPrivate } from "@logchimp/types";

import { router } from "../../../../../router";
import { useCopyText } from "../../../../../hooks";
import { useUserStore } from "../../../../../store/user";
import { deleteRoadmap } from "../../../../modules/roadmaps";
import { useSettingStore } from "../../../../../store/settings";

// components
import Dropdown from "../../../../../components/ui/dropdown/Dropdown.vue";
import DropdownWrapper from "../../../../../components/ui/dropdown/DropdownWrapper.vue";
import DropdownItem from "../../../../../components/ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../../../../../components/ui/dropdown/DropdownSpacer.vue";

const { settings } = useSettingStore();
const { permissions } = useUserStore();

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
    const response = await deleteRoadmap(id);

    if (response.status === 204) {
      // TODO: make it accessible, or update cache
      // getRoadmaps();
      console.log(`[Dashboard] Delete roadmap (${id})`);
    }
  } catch (error) {
    console.error(error);
  }
}

defineOptions({
  name: "DashboardRoadmapTabularItem",
});
</script>

<template>
  <DropdownV2Content
    align="end"
    side="bottom"
    :loop="true"
  >
    <DropdownItem
      @click="router.push(`/dashboard/settings/roles/${roleId}/settings`)"
    >
      <template #icon>
        <settings-icon aria-hidden="true" />
      </template>
      Settings
    </DropdownItem>
    <DropdownItem
      v-if="settings.developer_mode"
      @click="roleId ? useCopyText(roleId) : undefined"
      :disabled="!roleId"
    >
      <template #icon>
        <copy-icon aria-hidden="true" />
      </template>
      Copy ID
    </DropdownItem>
  </DropdownV2Content>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { Settings as SettingsIcon, Clipboard as CopyIcon } from "lucide-vue";

import { router } from "../../../../../router";
import { useCopyText } from "../../../../../hooks";
import { useSettingStore } from "../../../../../store/settings";
import { roleIdKey } from "./options";
import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";

const { settings } = useSettingStore();

const roleId = inject(roleIdKey);

defineOptions({
  name: "DashboardRolesTabularItemMoreOptionsDropdownContent",
});
</script>
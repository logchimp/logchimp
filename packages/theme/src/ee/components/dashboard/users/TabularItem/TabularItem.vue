<template>
  <div class="table-data users-table-user">
    <div class="users-table-user-avatar">
      <avatar :src="user.avatar" :name="(user.name || user.username) || ''" />
    </div>
  <div class="flex items-center justify-between">
      <h6 class="users-table-user-name">
        {{ user.name || user.username }}
      </h6>
    </div>
  </div>
  <div class="table-header-item users-table-user flex items-center gap-x-1.5">
    <DashboardUsersTabularItemRolePreviewer :roles="user.roles" />
    <AssignRoleUserDropdown />
  </div>
  <div class="table-data users-table-posts">
    {{ user.posts }}
  </div>
  <div class="table-data users-table-votes flex items-center justify-between gap-3">
    <span>{{ user.votes }}</span>
    <DropdownV2 class="table-icon-group users-table-icons">
      <template #trigger>
        <DropdownMenuTrigger
          :class="[
            'table-data-icon dropdown-menu-icon',
          ]"
          title="View options"
        >
          <EyeIcon aria-hidden="true" class="stroke-neutral-700 size-5" />
          <span class="sr-only">View options</span>
        </DropdownMenuTrigger>
      </template>

      <DropdownV2Content align="end" side="bottom" :loop="true">
        <DropdownV2Item @click="openUserDialog">
          <template #icon>
            <EyeIcon aria-hidden="true" />
          </template>
          View details
        </DropdownV2Item>
      </DropdownV2Content>
    </DropdownV2>
  </div>
  <MoreOptionsDropdown
    v-if="settings.developer_mode"
  />
</template>

<script setup lang="ts">
import { provide } from "vue";
import type { IUser, ISettings } from "@logchimp/types";

import { Avatar } from "../../../../../components/ui/Avatar";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import AssignRoleUserDropdown from "./AssignRoleUserDropdown.vue";
import { userIdKey } from "./options";
import DashboardUsersTabularItemRolePreviewer from "./RolePreviewer.vue";
import { DropdownMenuTrigger } from "reka-ui";
import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import DropdownV2Item from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import { MoreHorizontalIcon, EyeIcon } from "lucide-vue";

interface Props {
  user: IUser;
  settings: ISettings;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  openUserDialog: [user: IUser]
}>();

provide(userIdKey, props.user.userId);

const openUserDialog = () => {
  emit('openUserDialog', props.user);
};

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>

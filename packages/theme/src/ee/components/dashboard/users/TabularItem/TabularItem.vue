<template>
  <div class="table-data users-table-user">
    <div class="users-table-user-avatar">
      <avatar :src="user.avatar" :name="(user.name || user.username) || ''" />
    </div>
    <div class="flex items-center justify-between">
      <h6 class="users-table-user-name">
        {{ user.name || user.username }}
      </h6>
      <button
        @click="openUserDialog"
        class="ml-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
        title="View user details"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  </div>
  <div class="table-header-item users-table-user flex items-center gap-x-1.5">
    <DashboardUsersTabularItemRolePreviewer :roles="user.roles" />
    <AssignRoleUserDropdown />
  </div>
  <div class="table-data users-table-posts">
    {{ user.posts }}
  </div>
  <div class="table-data users-table-votes">
    {{ user.votes }}
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

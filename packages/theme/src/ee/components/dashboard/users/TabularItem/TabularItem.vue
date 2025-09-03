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
    <MoreOptionsDropdown />
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";
import type { IUser, ISettings } from "@logchimp/types";

import { Avatar } from "../../../../../components/ui/Avatar";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import AssignRoleUserDropdown from "./AssignRoleUserDropdown.vue";
import { userIdKey, openUserDialogKey } from "./options";
import DashboardUsersTabularItemRolePreviewer from "./RolePreviewer.vue";

interface Props {
  user: IUser;
  settings: ISettings;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  openUserDialog: [user: IUser]
}>();

const openUserDialog = () => {
  emit('openUserDialog', props.user);
};

provide(userIdKey, props.user.userId);
provide(openUserDialogKey, openUserDialog);

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>

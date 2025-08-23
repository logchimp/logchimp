<template>
  <div class="table-data users-table-user">
    <div class="users-table-user-avatar">
      <avatar :src="user.avatar" :name="user.name || user.username" />
    </div>
    <h6 class="users-table-user-name">
      {{ user.name || user.username }}
    </h6>
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

provide(userIdKey, props.user.userId);

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>

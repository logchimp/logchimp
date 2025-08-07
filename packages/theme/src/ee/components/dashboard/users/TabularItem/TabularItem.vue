<template>
  <div class="table-data users-table-user">
    <div class="users-table-user-avatar">
      <avatar :src="user.avatar" :name="user.name || user.username" />
    </div>
    <h6 class="users-table-user-name">
      {{ user.name || user.username }}
    </h6>
  </div>
  <div class="table-data">
    <div v-for="role in user.roles">
      <RoleBadge :role="role" :key="role.user_role_id" />
    </div>
  </div>
  <div class="table-data users-table-posts">
    {{ user.posts }}
  </div>
  <div class="table-data users-table-votes">
    {{ user.votes }}
  </div>
  <MoreOptionsDropdown
    v-if="settings.developer_mode"
    :user-id="user.userId"
  />
</template>

<script setup lang="ts">
import type { IUser, ISettings } from "@logchimp/types";

import { Avatar } from "../../../../../components/ui/Avatar";
import RoleBadge from "../../../RoleBadge.vue";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";

interface Props {
  user: IUser;
  settings: ISettings;
}

defineProps<Props>();

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>

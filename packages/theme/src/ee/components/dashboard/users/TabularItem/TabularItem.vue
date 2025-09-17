<template>
  <template v-for="cell in row.getVisibleCells()" :key="cell.id">
    <td
      v-if="cell.column.id === 'avatar'"
      class="users-table-user-avatar"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      <avatar :src="user.avatar" :name="user.name || user.username" />
    </td>

    <td v-else-if="cell.column.id === 'name'" class="table-data users-table-user font-medium"
        :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      {{ user.name || user.username }}
    </td>

    <td v-else-if="cell.column.id === 'roles'" class="table-header-item users-table-user flex items-center gap-x-1.5"
        :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      <DashboardUsersTabularItemRolePreviewer :roles="user.roles" />
      <AssignRoleUserDropdown />
    </td>

    <td v-else-if="cell.column.id === 'post_count'" class="table-data users-table-posts"
        :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      {{ user.posts }}
    </td>

    <td v-else-if="cell.column.id === 'votes_count'" class="table-data users-table-votes"
        :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      {{ user.votes }}
    </td>

    <td v-else-if="cell.column.id === 'more' && settings.developer_mode"
        :style="{
        width: `${cell.column.getSize()}px`,
      }">
      <MoreOptionsDropdown />
    </td>
  </template>
</template>

<script setup lang="ts">
import { provide } from "vue";
import type { Row } from "@tanstack/vue-table";
import type { IUser, ISiteSettings } from "@logchimp/types";

import { Avatar } from "../../../../../components/ui/Avatar";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import AssignRoleUserDropdown from "./AssignRoleUserDropdown.vue";
import { userIdKey } from "./options";
import DashboardUsersTabularItemRolePreviewer from "./RolePreviewer.vue";

interface Props {
  row: Row<IUser>;
  user: IUser;
  settings: ISiteSettings;
}

const props = defineProps<Props>();

provide(userIdKey, props.user.userId);

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>

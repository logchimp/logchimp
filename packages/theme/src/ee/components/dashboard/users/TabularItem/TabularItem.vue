<template>
  <template v-for="cell in row.getVisibleCells()" :key="cell.id">
    <Td
      v-if="cell.column.id === 'avatar'"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      <avatar :src="user.avatar" :name="user.name || user.username" />
    </Td>

    <Td
      v-else-if="cell.column.id === 'name'"
      class="font-medium"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      {{ user.name || user.username }}
    </Td>

    <Td
      v-else-if="cell.column.id === 'roles'"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      <div class="flex items-center gap-x-1.5">
        <DashboardUsersTabularItemRolePreviewer :roles="user.roles" />
        <AssignRoleUserDropdown />
      </div>
    </Td>

    <Td
      v-else-if="cell.column.id === 'post_count'"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      {{ user.posts }}
    </Td>

    <Td
      v-else-if="cell.column.id === 'votes_count'"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
    >
      {{ user.votes }}
    </Td>

    <Td
      v-else-if="cell.column.id === 'more' && settings.developer_mode"
      :style="{
        width: `${cell.column.getSize()}px`,
      }"
      :ignore-px="true"
      :ignore-py="true"
    >
      <div class="flex items-center justify-center">
        <MoreOptionsDropdown />
      </div>
    </Td>
  </template>
</template>

<script setup lang="ts">
import { provide } from "vue";
import type { Row } from "@tanstack/vue-table";
import type { IUser, ISiteSettings } from "@logchimp/types";

import { userIdKey } from "./options";

import { Avatar } from "../../../../../components/ui/Avatar";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import AssignRoleUserDropdown from "./AssignRoleUserDropdown.vue";
import DashboardUsersTabularItemRolePreviewer from "./RolePreviewer.vue";
import Td from "../../../../../components/ui/Table/Td.vue";

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

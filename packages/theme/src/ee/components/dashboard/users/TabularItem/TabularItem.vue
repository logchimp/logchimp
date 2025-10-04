<template>
  <div class="relative group flex items-center">
    <Td
      class="font-medium flex items-center gap-x-3"
      :style="{
        minWidth: '150px',
      }"
    >
      <avatar :src="user.avatar" :name="user.name || user.username" />
      {{ user.name || user.username }}
      <UserInfoDialog :user="user" />
    </Td>

    <Td
      :style="{
        width: '350px',
      }"
    >
      <div class="flex items-center gap-x-1.5">
        <DashboardUsersTabularItemRolePreviewer :roles="user.roles" />
        <div class="relative z-[2]">
          <AssignRoleUserDropdown />
        </div>
      </div>
    </Td>

    <Td
      :style="{
        width: '100px',
      }"
    >
      {{ user.posts }}
    </Td>

    <Td
      :style="{
        width: '100px',
      }"
    >
      {{ user.votes }}
    </Td>

    <Td
      :style="{
        width: '100px',
      }"
      :ignore-px="true"
      :ignore-py="true"
    >
      <div class="flex items-center justify-center relative z-[1]">
        <MoreOptionsDropdown />
      </div>
    </Td>
  </div>
</template>

<script setup lang="ts">
import { provide, defineAsyncComponent } from "vue";
import type { IUser, ISiteSettings } from "@logchimp/types";

import { userIdKey } from "./options";

import { Avatar } from "../../../../../components/ui/Avatar";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import AssignRoleUserDropdown from "./AssignRoleUserDropdown.vue";
import DashboardUsersTabularItemRolePreviewer from "./RolePreviewer.vue";
import Td from "../../../../../components/ui/Table/Td.vue";

const UserInfoDialog = defineAsyncComponent(
  () => import("../UserInfo/UserInfoDialog.vue"),
);

interface Props {
  user: IUser;
  settings: ISiteSettings;
}

const props = defineProps<Props>();

provide(userIdKey, props.user.userId);

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>

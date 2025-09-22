<template>
  <div class="table-data users-table-user">
    <div class="users-table-user-avatar">
      <avatar :src="user.avatar" :name="user.name || user.username" />
    </div>
    <h6 class="users-table-user-name">
      {{ user.name || user.username }}
      <UserInfoDialog :user="user" />
    </h6>
  </div>
  <div class="table-header-item users-table-user flex items-center gap-x-1.5">
    <DashboardUsersTabularItemRolePreviewer :roles="user.roles" />
    <div class="relative z-[2]">
      <AssignRoleUserDropdown />
    </div>
  </div>
  <div class="table-data users-table-posts">
    {{ user.posts }}
  </div>
  <div class="table-data users-table-votes">
    {{ user.votes }}
  </div>
  <div class="flex items-center justify-center relative z-[1]">
    <MoreOptionsDropdown />
  </div>
</template>

<script setup lang="ts">
import { provide, defineAsyncComponent } from "vue";
import type { IUser, ISiteSettings } from "@logchimp/types";

import { Avatar } from "../../../../../components/ui/Avatar";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import AssignRoleUserDropdown from "./AssignRoleUserDropdown.vue";
import { userIdKey } from "./options";
import DashboardUsersTabularItemRolePreviewer from "./RolePreviewer.vue";

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

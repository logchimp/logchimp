<template>
  <RoleBadge
    v-if="roles[0]"
    :role="roles[0]"
  />
  <div
    v-if="roles.length > 2"
    class="px-2 py-1 bg-neutral-300 rounded-lg text-sm font-medium select-none"
  >
    +{{roles.length - 1}}
  </div>
  <template v-else>
    <RoleBadge
      v-for="role in roles.slice(1)"
      :role="role"
      :key="role.user_role_id"
    />
  </template>
</template>

<script setup lang="ts">
import type { IUserRole } from "@logchimp/types";

import RoleBadge from "../../../RoleBadge.vue";

interface Props {
  roles: IUserRole[];
}

defineProps<Props>();

defineOptions({
  name: "DashboardUsersTabularItemRolePreviewer",
});
</script>
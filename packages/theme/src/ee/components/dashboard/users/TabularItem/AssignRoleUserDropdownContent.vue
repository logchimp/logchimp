<template>
  <div class="">
    <div v-if="dashboardRoles.isLoading">
      Loading...
    </div>

    <DropdownV2CheckboxItem
      v-for="role in dashboardRoles.roles"
      :model-value="assignedRoles.has(role.id)"
      @update:model-value="(e) => updateRoleHandler(role.id, e)"
      :key="role.id"
    >
      {{role.name}}
    </DropdownV2CheckboxItem>
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject } from "vue";

import { useDashboardRoles } from "../../../../../store/dashboard/roles.ts";
import DropdownV2CheckboxItem from "../../../../../components/ui/DropdownV2/CheckboxItem.vue";
import { userRolesKey } from "./options";

const dashboardRoles = useDashboardRoles();

onMounted(() => {
  dashboardRoles.fetchRoles();
});

const msg = inject(userRolesKey, []);
const assignedRoles = new Map<string, boolean>();
onMounted(() => {
  for (let i = 0; i < msg.length; i++) {
    assignedRoles.set(msg[i].id, true);
  }
});

// how would I know the role ID, inside this function???
function updateRoleHandler(roleId: string, e: boolean) {
  // TODO: assign & un-assign roles
}

defineOptions({
  name: "AssignRoleUserDropdownContent",
});
</script>

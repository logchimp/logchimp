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
import { onMounted, inject, ref } from "vue";

import { useDashboardRoles } from "../../../../../store/dashboard/roles";
import { useDashboardUsers } from "../../../../../store/dashboard/users";
import DropdownV2CheckboxItem from "../../../../../components/ui/DropdownV2/CheckboxItem.vue";
import { userRolesKey, userIdKey } from "./options";
import { UsersEe } from "../../../../modules/users";

const dashboardRoles = useDashboardRoles();
const dashboardUsers = useDashboardUsers();
const usersEeServices = new UsersEe();

onMounted(() => {
  dashboardRoles.fetchRoles();
});

const roles = inject(userRolesKey, []);
const userId = inject(userIdKey);
const assignedRoles = ref(new Map<string, boolean>());
onMounted(() => {
  for (let i = 0; i < roles.length; i++) {
    assignedRoles.value.set(roles[i].id, true);
  }
});

// assign role handler
async function assignRoleHandler(roleId: string) {
  if (!userId) return;

  try {
    const response = await usersEeServices.assignRole(roleId, userId);
    if (response.success === 1) {
      assignedRoles.value.set(roleId, true);
      dashboardUsers.appendUserRole(userId, {
        id: response.id,
        name: response.name,
        user_role_id: response.user_role_id,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function unassignRoleHandler(roleId: string) {
  if (!userId) return;

  try {
    const response = await usersEeServices.unassignRole(roleId, userId);
    if (response) {
      assignedRoles.value.delete(roleId);
      dashboardUsers.removeUserRole(userId, roleId);
    }
  } catch (error) {
    console.error(error);
  }
}

function updateRoleHandler(roleId: string, e: boolean) {
  if (e) {
    assignRoleHandler(roleId);
  } else {
    unassignRoleHandler(roleId);
  }
}

defineOptions({
  name: "AssignRoleUserDropdownContent",
});
</script>

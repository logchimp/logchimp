<template>
  <div class="">
    <div v-if="dashboardRoles.isLoading">
      Loading...
    </div>

    <DropdownV2CheckboxItem
      v-for="role in dashboardRoles.roles"
      :model-value="userHasRole(role.id)"
      @update:model-value="(checked) => updateRoleHandler(role.id, checked)"
      :key="role.id"
    >
      {{role.name}}
    </DropdownV2CheckboxItem>
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject, computed } from "vue";

import { useDashboardRoles } from "../../../../store/dashboard/roles";
import { useDashboardUsers } from "../../../../../store/dashboard/users";
import DropdownV2CheckboxItem from "../../../../../components/ui/DropdownV2/CheckboxItem.vue";
import { userIdKey } from "./options";
import { UsersEe } from "../../../../modules/users";

const dashboardRoles = useDashboardRoles();
const dashboardUsers = useDashboardUsers();
const usersEeServices = new UsersEe();

onMounted(() => {
  dashboardRoles.fetchRoles();
});

const userId = inject(userIdKey);

const assignedRoleIds = computed(() => {
  if (!userId) return new Set<string>();

  const user = dashboardUsers.getUserById(userId);
  return new Set(user?.roles?.map((role) => role.id) || []);
});

function userHasRole(roleId: string): boolean {
  return assignedRoleIds.value.has(roleId);
}

// assign role handler
async function assignRoleHandler(roleId: string) {
  if (!userId) return;

  try {
    const response = await usersEeServices.assignRole(roleId, userId);
    if (response.success === 1) {
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

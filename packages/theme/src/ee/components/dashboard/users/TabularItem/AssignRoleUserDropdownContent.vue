<template>
  <div class="">
    <div v-if="dashboardRoles.state === 'LOADING'">Loading...</div>

    <DropdownV2CheckboxItem
      v-for="role in dashboardRoles.roles"
      :key="role.id"
      :model-value="userHasRole(role.id)"
      :keep-open-on-shift="true"
      @update:model-value="(checked) => updateRoleHandler(role.id, checked)"
    >
      <span>
        {{ role.name }}
      </span>
      <ComputerIcon
        v-if="role.isSystem"
        class="size-4 stroke-neutral-400 shrink-0"
      />
    </DropdownV2CheckboxItem>
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject, computed } from "vue";
import { ComputerIcon } from "lucide-vue";
import type { components } from "@logchimp/api-ts-types";
import type { AxiosError } from "axios";

import { useDashboardRoles } from "../../../../store/dashboard/roles";
import { useDashboardUsers } from "../../../../../store/dashboard/users";
import DropdownV2CheckboxItem from "../../../../../components/ui/DropdownV2/CheckboxItem.vue";
import { userIdKey } from "./options";
import { UsersEEAPI } from "../../../../modules/users";
import { useAlertStore } from "../../../../../store/alert.ts";

const { add: toast } = useAlertStore();
const dashboardRoles = useDashboardRoles();
const dashboardUsers = useDashboardUsers();
const usersEeServices = new UsersEEAPI();

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
      const successResponse =
        response as components["schemas"]["AssignRoleToUserResponseBodySuccess"];
      dashboardUsers.appendUserRole(userId, {
        id: successResponse.id,
        name: successResponse.name,
        isSystem: successResponse.isSystem,
        user_role_id: successResponse.user_role_id,
      });
    }
  } catch (error) {
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to assign role to user",
      type: "error",
    });
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
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to remove role from user",
      type: "error",
    });
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

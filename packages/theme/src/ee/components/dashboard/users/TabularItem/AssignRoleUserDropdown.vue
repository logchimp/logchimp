<template>
  <DropdownV2 :modal="true">
    <template #trigger>
      <DropdownMenuTrigger
        v-show="!disabled"
        :class="[
          'group-hover:block group-focus:block data-[state=open]:block',
          'hidden bg-neutral-300 rounded-md p-1 cursor-pointer',
        ]"
        :disabled="disabled"
      >
        <PlusIcon aria-hidden="true" class="stroke-neutral-700 size-5"/>
        <span class="sr-only">Add role</span>
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="start"
      side="right"
      :sideOffset="10"
      :loop="true"
      :max-height="200"
    >
      <AssignRoleUserDropdownContent />
    </DropdownV2Content>
  </DropdownV2>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { PlusIcon } from "lucide-vue";
import { DropdownMenuTrigger } from "reka-ui";
import type { TPermission } from "@logchimp/types";

import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import { useUserStore } from "../../../../../store/user";
const AssignRoleUserDropdownContent = defineAsyncComponent(
  () => import("./AssignRoleUserDropdownContent.vue"),
);

const userStore = useUserStore();

const REQUIRED_PERMISSIONS: TPermission[] = ["role:assign", "role:unassign"];
const disabled = computed(() => {
  if (!userStore.getUserId) return false;

  const hasRequiredPermission = REQUIRED_PERMISSIONS.some((permission) =>
    userStore.permissions.includes(permission),
  );

  return !hasRequiredPermission;
});

defineOptions({
  name: "AssignRoleUserDropdown",
});
</script>

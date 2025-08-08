<template>
  <DropdownV2 :modal="true">
    <template #trigger>
      <DropdownMenuTrigger class="group-hover:block group-focus:block bg-neutral-300 rounded-md p-1 cursor-pointer">
        <PlusIcon aria-hidden="true" class="stroke-neutral-700 size-5"/>
        <span class="sr-only">Add role</span>
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="start"
      side="right"
      :sideOffset="10"
      :loop="true"
    >
      <AssignRoleUserDropdownContent />
    </DropdownV2Content>
  </DropdownV2>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { PlusIcon } from "lucide-vue";
import { DropdownMenuTrigger } from "reka-ui";

import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
const AssignRoleUserDropdownContent = defineAsyncComponent(
  () => import("./AssignRoleUserDropdownContent.vue"),
);

defineOptions({
  name: "AssignRoleUserDropdown",
});
</script>

<template>
  <dropdown-v2>
    <template #trigger>
      <DropdownMenuTrigger
        :class="[
          'group/menu cursor-pointer',
          'p-2.5 rounded-full hover:bg-neutral-300',
        ]"
      >
        <MoreHorizontalIcon aria-hidden="true" class="stroke-neutral-400 group-hover/menu:stroke-neutral-700 size-5" />
        <span class="sr-only">More options</span>
      </DropdownMenuTrigger>
    </template>

    <Content />
  </dropdown-v2>
</template>

<script setup lang="ts">
import { DropdownMenuTrigger } from "reka-ui";
import { MoreHorizontalIcon } from "lucide-vue";

import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import Content from "./MoreOptionsDropdownContent.vue";

defineOptions({
  name: "DashboardBoardsTabularItemMoreOptionsDropdown",
});
</script>
<template>
  <DropdownV2 class="table-icon-group boards-table-icons">
    <template #trigger>
      <DropdownMenuTrigger
        :class="[
          'table-data table-data-icon',
          'boards-table-icon-settings',
          'dropdown-menu-icon',
        ]"
      >
        <MoreHorizontalIcon aria-hidden="true" class="stroke-neutral-700 size-5" />
        <span class="sr-only">More options</span>
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="end"
      side="bottom"
      :loop="true"
    >
      <MoreOptionsDropdownContent />
    </DropdownV2Content>
  </DropdownV2>
</template>

<script setup lang="ts">
import { MoreHorizontalIcon } from "lucide-vue";
import { DropdownMenuTrigger } from "reka-ui";

import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "../../../../../components/ui/DropdownV2/DropdownContent.vue";
import MoreOptionsDropdownContent from "./MoreOptionsDropdownContent.vue";
</script>

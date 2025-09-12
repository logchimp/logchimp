<template>
  <dropdown-menu-separator
    :class="[
      'w-[calc(100%-12px)] h-px bg-neutral-300 my-1.5 mx-1.5',
    ]"
  />
</template>

<script setup lang="ts">
import { DropdownMenuSeparator } from "reka-ui";

defineOptions({
  name: "DropdownV2Separator",
});
</script>

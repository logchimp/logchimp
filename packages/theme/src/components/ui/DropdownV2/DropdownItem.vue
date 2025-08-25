<template>
  <dropdown-menu-item
    :class="[
      'group text-sm rounded-md flex items-center gap-x-2.5 py-2 px-3 select-none outline-none',
      'hover:bg-neutral-200/70',
      // disabled
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-70',
    ]"
  >
    <!-- icon -->
    <div class="size-5 [&>svg]:size-5 [&>svg]:stroke-neutral-700">
      <slot name="icon" />
    </div>

    <slot />
  </dropdown-menu-item>
</template>

<script setup lang="ts">
import { DropdownMenuItem } from "reka-ui";

defineOptions({
  name: "DropdownV2Item",
});
</script>

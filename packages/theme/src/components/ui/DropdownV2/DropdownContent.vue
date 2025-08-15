<template>
  <DropdownMenuContent
    :class="[
      'p-1 w-40',
      'shadow-sm border border-neutral-300 bg-white rounded-lg'
    ]"
  >
    <slot />
  </DropdownMenuContent>
</template>

<script setup lang="ts">
import { DropdownMenuContent } from "reka-ui";

defineOptions({
  name: "DropdownV2Content",
});
</script>

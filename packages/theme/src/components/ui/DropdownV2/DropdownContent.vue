<template>
  <DropdownMenuContent
    :class="[
      'p-1 w-40 overflow-y-auto',
      'shadow-sm border border-neutral-300 bg-white rounded-lg'
    ]"
    :style="{
      'max-height': maxHeight ? `${maxHeight}px` : undefined,
    }"
  >
    <slot />
  </DropdownMenuContent>
</template>

<script setup lang="ts">
import { DropdownMenuContent } from "reka-ui";

interface Props {
  maxHeight?: number;
}

defineProps<Props>();

defineOptions({
  name: "DropdownV2Content",
});
</script>

<template>
  <dropdown-menu-item
    :class="[
      'group rounded-md flex items-center gap-x-2.5 py-2 px-3 select-none outline-none',
      'text-sm font-medium',
      'hover:bg-neutral-200/70',
      variant === 'danger' && 'text-red-600/90 hover:bg-red-600/90 hover:text-white',
      // disabled
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-70',
    ]"
  >
    <!-- icon -->
    <div
      :class="[
        'size-5 [&>svg]:size-5',
        '[&>svg]:stroke-neutral-700',
        variant === 'danger' && '[&>svg]:stroke-red-600/90 group-hover:[&>svg]:stroke-white',
      ]"
    >
      <slot name="icon" />
    </div>

    <slot />
  </dropdown-menu-item>
</template>

<script setup lang="ts">
import { DropdownMenuItem } from "reka-ui";

interface Props {
  variant?: "danger";
}

defineProps<Props>();

defineOptions({
  name: "DropdownV2Item",
});
</script>

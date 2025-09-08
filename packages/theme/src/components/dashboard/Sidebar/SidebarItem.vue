<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

defineProps<{
  to: RouteLocationRaw;
}>();
</script>

<template>
  <router-link
    :class="[
      'flex items-center gap-x-2 py-2 px-3 rounded-lg',
      'hover:bg-neutral-800/5',
      '[&>svg]:stroke-neutral-700 [&>svg]:size-4',
      '[&>p]:text-neutral-700 [&>p]:text-sm [&>p]:font-medium',
      // active
      'aria-[current=page]:bg-white',
      'aria-[current=page]:[&>p]:font-semibold',
    ]"
    :to="to"
  >
    <slot />
  </router-link>
</template>

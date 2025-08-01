<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

defineProps<{
  to: RouteLocationRaw;
}>();
</script>

<template>
  <router-link
    :class="[
      'flex items-center py-2 px-3 rounded-lg',
      '[&>svg]:stroke-(--color-white) [&>svg]:size-4 [&>svg]:mr-1.5',
      '[&>p]:text-(--color-white)',
      // active
      'aria-[current=page]:bg-white/10',
      'aria-[current=page][&>p]:font-semibold',
      'aria-[current=page][&>p]:text-pink-500',
    ]"
    :to="to"
  >
    <slot />
  </router-link>
</template>

<template>
  <label
    :for="htmlFor"
    class="text-sm mb-1.5 text-(--color-gray-60)"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
interface Props {
  htmlFor: string;
}

defineProps<Props>();
</script>

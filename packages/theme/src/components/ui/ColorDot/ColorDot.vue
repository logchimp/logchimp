<script setup lang="ts">
defineProps({
  color: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div
    data-test="color-dot"
    class="size-2.5 rounded-full"
    :style="{
      backgroundColor: `#${color}`
    }"
    aria-hidden="true"
  />
</template>

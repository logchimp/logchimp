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
    class="min-w-2.5 min-h-2.5 max-w-2.5 max-h-2.5 rounded-full"
    :style="{
      backgroundColor: `#${color}`
    }"
  />
</template>

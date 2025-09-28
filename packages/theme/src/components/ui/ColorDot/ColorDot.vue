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
    :class="['rounded-full', $style.ColorDot]"
    :style="{
      backgroundColor: `#${color}`
    }"
    aria-hidden="true"
  />
</template>

<style module lang="css">
.ColorDot {
  --size: 0.625rem;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  min-height: var(--size);
}
</style>
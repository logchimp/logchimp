<script setup lang="ts">
defineProps({
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    validator: (value: "xs" | "sm" | "md") =>
      ["xs", "sm", "md"].includes(value),
    default: "md",
  },
});
</script>

<template>
  <div
    data-test="color-dot"
    :class="[
      'rounded-full',
      {
        'size-2.5': size === 'md',
        'size-2': size === 'sm',
        'size-1.75': size === 'xs',
      },
    ]"
    :style="{
      backgroundColor: `#${color}`,
    }"
    aria-hidden="true"
  />
</template>

<template>
  <div class="text-xs text-right" :class="textColorClass">

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  isError: {
    type: Boolean,
    default: false,
  },
});

const textColorClass = computed(() =>
  props.isError ? "input-error-message" : "text-neutral-500",
);
</script>

<template>
  <div class="text-sm text-right" :class="textColorClass">

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
  props.isError ? "text-red-600" : "text-neutral-700",
);
</script>

<template>
  <div
    class="text-sm text-right"
    :class="{'text-neutral-700': !isError,
      'text-red-600': isError
    }"
  >
  <slot>
  </slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isError: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="select-none overflow-hidden" @click="$emit('click')">
    <div
      v-if="src"
      data-test="avatar-image"
    >
      <img
        :src="src"
        :alt="name"
        class="max-w-8 max-h-8 size-8 rounded-full pointer-events-none"
      >
    </div>
    <div
      v-else
      data-test="avatar-initials"
      :class="[
        'max-w-8 max-h-8 size-8 rounded-full',
        'text-(--color-white) font-medium uppercase',
        'border border-(--color-white)',
        'flex items-center justify-center',
      ]"
    >
      {{ initals }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
});

const initals = computed(() => {
  return props.name.slice(0, 1);
});
</script>

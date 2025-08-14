<template>
  <router-link
    v-if="showBoard"
    data-test="board-badge"
    class="block w-fit select-none truncate"
    :to="`/boards/${url}`"
  >
    <div class="flex items-center px-2.5 py-1 bg-(--color-gray-95) rounded-full">
      <color-dot :color="color" />
      <p class="ml-1.5 text-(--color-gray-50)" data-test="board-badge-name">
        {{ name }}
      </p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import ColorDot from "../ColorDot.vue";

defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    validator: (value: string) => {
      return value.length === 6;
    },
  },
  url: {
    type: String,
    required: true,
  },
  showBoard: {
    type: Boolean,
    required: true,
  },
});
</script>

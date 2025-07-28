<template>
  <router-link
    data-test="board-item"
    :to="`/boards/${url}`"
    class="flex items-center gap-2.5 select-none rounded-md bg-(--color-gray-97) hover:bg-(--color-gray-95) px-6 py-4"
  >
    <div
      class="color-dot"
      data-test="board-item-color"
      :style="{
        backgroundColor: `#${color}`
      }"
    />
    <div class="flex items-center justify-between w-full overflow-hidden">
      <div data-test="board-item-name" class="text-(--color-gray-40) font-medium truncate">
        {{ name }}
      </div>
      <div data-test="board-item-postcount" class="text-(--color-gray-60) font-semibold text-sm ml-4">
        {{ postCount }}
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
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
  postCount: {
    type: Number,
    default: 0,
  },
});
</script>

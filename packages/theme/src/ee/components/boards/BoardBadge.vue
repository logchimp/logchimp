<template>
  <router-link
    data-test="board-badge"
    class="block w-fit select-none max-w-full min-w-0"
    :to="`/boards/${encodeURIComponent(url)}`"
  >
    <div
      :class="[
        'flex items-center bg-(--color-gray-95) rounded-full',
        {
          'px-2.5 py-1': size === 'md',
          'px-2 py-0.75': size === 'sm',
          'px-1.75 py-0.5': size === 'xs',
        },
      ]"
    >
      <color-dot :color="color" :size="size" class="shrink-0" />
      <p
        :class="[
          'ml-1.5 text-(--color-gray-50) truncate min-w-0',
          {
            'text-base': size === 'md',
            'text-sm': size === 'sm',
            'text-xs': size === 'xs',
          },
        ]"
        data-test="board-badge-name"
      >
        {{ name }}
      </p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import ColorDot from "../../../components/ui/ColorDot/ColorDot.vue";

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
  size: {
    type: String,
    validator: (value: "xs" | "sm" | "md") =>
      ["xs", "sm", "md"].includes(value),
    default: "md",
  },
});
</script>

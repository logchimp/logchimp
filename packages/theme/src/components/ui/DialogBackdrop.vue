<template>
  <component
    :is="as"
    :class="[
      'fixed left-0 top-0 z-50 h-dvh w-screen',
      'transition-[background-color,backdrop-filter]',
      'bg-black/20 backdrop-blur-sm pointer-events-none',
      isVisible ? 'opacity-100' : 'opacity-0',
    ]"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import type { Component } from "vue";

interface IProps {
  isVisible: boolean;
  as?: Component | string;
}

withDefaults(defineProps<IProps>(), {
  as: "div",
  isVisible: false,
});
</script>

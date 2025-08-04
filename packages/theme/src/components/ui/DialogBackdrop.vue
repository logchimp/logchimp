<template>
  <div
    :class="[
      'fixed left-0 top-0 z-50 h-dvh w-screen',
      'transition-[background-color,backdrop-filter]',
      'bg-black/20 backdrop-blur-sm',
      isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      'md:hidden'
    ]"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
interface IProps {
  isVisible: boolean;
}

withDefaults(defineProps<IProps>(), {
  isVisible: false,
});
</script>

<template>
  <div :class="[
    'px-6 py-3 flex items-center border-b-[3px] cursor-pointer',
    active ? 'border-(--color-brand-color)' : 'border-(--color-white)'
  ]" @click="$emit('click')">
    <div :class="[
      'flex mr-2.5 [&>svg]:size-5',
      active ? '[&>svg]:stroke-(--color-brand-color)' : '[&>svg]:stroke-(--color-gray-70)',
    ]">
      <slot name="icon" />
    </div>
    <h6 :class="['mb-0',
      active ? 'text-(--color-brand-color)' : 'text-(--color-gray-70)',
    ]">
      <slot />
    </h6>
  </div>
</template>

<script setup lang="ts">
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
</script>

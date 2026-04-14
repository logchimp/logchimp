<template>
  <div class="select-none overflow-hidden">
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
        'border font-medium uppercase',
        'flex items-center justify-center',
        bgColor === 'dark' ? 'text-(--color-white) border-(--color-white)' : 'text-(--color-black) border-(--color-black)'
      ]"
    >
      {{ name.slice(0, 1) }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src?: string | null;
  name: string;
  bgColor?: "light" | "dark";
}

withDefaults(defineProps<Props>(), {
  bgColor: "dark",
});
</script>

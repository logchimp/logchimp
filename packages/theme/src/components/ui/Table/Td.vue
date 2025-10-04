<template>
  <div
    :class="[
      'text-neutral-700',
      {
        'px-6': !ignorePx,
        'py-4': !ignorePy,
        'text-sm tracking-wide font-bold': head
      }
    ]"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  head?: boolean;
  ignorePy?: boolean;
  ignorePx?: boolean;
}

withDefaults(defineProps<Props>(), {
  head: false,
  ignorePy: false,
  ignorePx: false,
});
</script>
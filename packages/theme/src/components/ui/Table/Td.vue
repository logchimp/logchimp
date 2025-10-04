<template>
  <div
    :class="[
      {
        'px-6': !ignorePx,
        'py-3': !ignorePy,
      }
    ]"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  ignorePy?: boolean;
  ignorePx?: boolean;
}

withDefaults(defineProps<Props>(), {
  ignorePy: false,
  ignorePx: false,
});
</script>
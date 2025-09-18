<template>
  <td :class="[
    {
      'px-6': !ignorePx,
      'py-3': !ignorePy,
    }
  ]">
    <slot />
  </td>
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
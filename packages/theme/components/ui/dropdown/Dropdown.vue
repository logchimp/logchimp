<template>
  <div
    class="dropdown"
    :style="{
      maxHeight: height ? `${height}px` : '',
      overflowY: height ? 'auto' : ''
    }"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: "Dropdown",
  props: {
    height: {
      type: Number,
      default: 0
    }
  }
};
</script>

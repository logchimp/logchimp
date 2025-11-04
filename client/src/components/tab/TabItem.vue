<template>
  <div class="tab-item" @click="$emit('click')">
    <div class="tab-item-icon">
      <slot name="icon" />
    </div>
    <h6 class="tab-item-content">
      <slot />
    </h6>
  </div>
</template>

<script>
export default {
  name: "TabItem"
};
</script>

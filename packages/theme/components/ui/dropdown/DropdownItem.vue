<template>
  <div
    class="dropdown-item"
    :class="{
      'dropdown-item-disabled': disabled
    }"
    @click="click"
  >
    <div class="dropdown-item-icon">
      <slot name="icon" />
    </div>
    <div class="dropdown-item-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "DropdownItem",
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click() {
      if (this.disabled) return;
      this.$emit("click");
    }
  }
};
</script>

<template>
  <div
    v-on-clickaway="away"
    class="dropdown-wrapper"
    @click="click"
  >
    <slot name="toggle" />
    <slot :active="active" />
  </div>
</template>

<script>
// packages
import { mixin as clickaway } from "vue-clickaway";

export default {
  name: "DropdownWrapper",
  mixins: [clickaway],
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      active: false
    };
  },
  methods: {
    click() {
      if (this.disabled) return;
      this.active = !this.active;
    },
    away() {
      this.active = false;
    }
  }
};
</script>

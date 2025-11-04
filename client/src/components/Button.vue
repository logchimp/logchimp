<template>
  <div
    class="button"
    :class="[
      `button-${type}`,
      loading ? 'button-loading' : '',
      disabled ? 'button-primary-disabled' : ''
    ]"
    @click="click"
  >
    <slot />
    <div v-if="loading" class="button-loader">
      <loader-icon />
    </div>
  </div>
</template>

<script>
// icons
import LoaderIcon from "./icons/Loader";

export default {
  name: "Button",
  components: {
    LoaderIcon
  },
  props: {
    type: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click() {
      if (this.loading) return;
      if (this.disabled) return;
      this.$emit("click");
    }
  }
};
</script>

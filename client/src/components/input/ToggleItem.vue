<template>
  <div class="toggle-item">
    <div class="toggle-item-row">
      <label data-test="toggle-item-label">{{ label }}</label>
      <toggle
        ref="toggleRefs"
        :checked="value"
        :disabled="disabled"
        @input="emit"
      />
    </div>
    <p
      v-if="note"
      data-test="toggle-item-note"
      class="toggle-item-note"
    >
      {{ note }}
    </p>
  </div>
</template>

<script>
// components
import Toggle from "./Toggle";

export default {
  name: "ToggleItem",
  components: {
    Toggle
  },
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      default: false
    },
    note: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    emit(event) {
      if (this.disabled) return;
      this.check = event;
      this.$emit("input", event);
    }
  }
};
</script>

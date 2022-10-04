<template>
  <label class="input">
    <p v-if="label" class="input-field-label">{{ label }}</p>
    <textarea
      :value="value"
      class="input-field input-textarea"
      :class="{
        'input-field-disabled': disabled
      }"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
    />
    <p v-if="error.show" class="input-error-message">{{ error.message }}</p>
  </label>
</template>

<script>
export default {
  name: "LTextarea",
  props: {
    label: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    rows: {
      type: String,
      default: "3"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: Object,
      default: () => {
        return {
          show: false,
          message: ""
        };
      }
    }
  }
};
</script>

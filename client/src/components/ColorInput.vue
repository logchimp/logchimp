<template>
  <div class="input">
    <label class="input-field-label" for="accent-color">Color</label>
    <div class="color-input">
      <div
        class="color-preview"
        :class="{
          'input-error': error.show
        }"
        :style="{
          backgroundColor: `#${value}`
        }"
      />
      <input
        :value="value"
        class="input-field"
        :class="{
          'input-error': error.show
        }"
        type="text"
        placeholder="abcdef"
        spellcheck="false"
        @input="$emit('input', $event.target.value)"
        @click="hideError"
      >
    </div>
    <p
      v-if="error.show"
      data-test="input-error-message"
      class="input-error-message"
    >
      {{ error.message }}
    </p>
  </div>
</template>

<script>
export default {
  name: "ColorInput",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      error: {
        show: false,
        message: "The color should be in valid hex format."
      }
    };
  },
  watch: {
    value: function(newValue) {
      const validColor = /^[0-9A-F]{6}$/i.test(newValue);
      if (!validColor) this.error.show = true;
      else this.error.show = false;
    }
  },
  methods: {
    hideError() {
      this.error.show = false;
    }
  }
};
</script>

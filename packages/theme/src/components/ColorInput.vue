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
          backgroundColor: `#${modelValue}`
        }"
      />
      <input
        :value="modelValue"
        class="input-field"
        :class="{
          'input-error': error.show
        }"
        type="text"
        placeholder="abcdef"
        spellcheck="false"
        @input="input"
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

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { formInputBind } from './input/formInputBind';

const props = defineProps({
	...formInputBind,
});

const emit = defineEmits<{
	(e: 'update:modelValue', event?: any): void
}>();

const error = reactive({
	show: false,
	message: "The color should be in valid hex format."
})

watch(() => props.modelValue, (newValue) => {
	const validColor = /^[0-9A-F]{6}$/i.test(newValue);
	if (!validColor) error.show = true;
	else error.show = false;
})

function hideError() {
	error.show = false;
}

function input(event: any) {
	emit('update:modelValue', event.target.value)
}
</script>

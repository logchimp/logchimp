<template>
  <div class="input">
    <label class="input-field-label" for="accent-color">{{ label }}</label>
    <div class="color-input">
      <div
        class="color-preview"
        data-test="color-preview"
        :class="{
          'input-error': error.show,
        }"
        :style="{
          backgroundColor: `#${modelValue || 'fff'}`,
        }"
      />
      <input
        :value="modelValue"
        class="input-field"
        :class="{
          'input-error': error.show,
        }"
        type="text"
        :placeholder="placeholder"
        spellcheck="false"
        :disabled="disabled ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        @input="input"
        @click="hideError"
      />
    </div>
    <p v-if="description" class="input-description">
      {{ description }}
    </p>
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
import { reactive, watch } from "vue";
import type { FormFieldErrorType, IFormBaseProps } from "./input/formBaseProps";
import type { FormInputBinds } from "./input/formInputBind";

const props = withDefaults(defineProps<IFormBaseProps & FormInputBinds>(), {
  label: "Color",
  placeholder: "abcdef",
});

const emit = defineEmits<{
  (e: "hide-error", event: FormFieldErrorType): void;
  (e: "update:modelValue", event: string): void;
}>();

const InvalidColorCodeErrorMessage = "Please enter a valid color code.";
const error = reactive({
  show: false,
  message: "",
});

watch(
  () => props.error,
  (newError) => {
    if (newError) {
      Object.assign(error, newError);
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) return;
    const validColor = /^[0-9A-F]{6}$/i.test(newValue);
    error.show = !validColor;
    error.message = InvalidColorCodeErrorMessage;
  },
);

function hideError() {
  error.show = false;
  emit("hide-error", {
    show: false,
    message: "",
  });
}

function input(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<style lang="sass">
.color-input
	display: flex
	position: relative

	&::after
		content: "#"
		position: absolute
		top: 0.75rem
		left: 3.2rem
		color: var(--color-gray-70)
		font-family: inherit
		font-size: 0.875rem

	.input-field
		border-left: 0
		border-top-left-radius: 0
		border-bottom-left-radius: 0
		padding-left: 1.626rem

.color-preview
	width: 2.5rem
	height: 2.5rem
	border: 1px solid var(--color-gray-90)
	border-radius: var(--border-radius-default)
	border-top-right-radius: 0
	border-bottom-right-radius: 0
</style>

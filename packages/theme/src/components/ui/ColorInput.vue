<template>
  <div class="input">
    <label class="input-field-label" for="accent-color">{{ label }}</label>
    <div class="color-input">
      <div
        class="color-preview"
        data-test="color-preview"
        :class="{
          'input-error': !!errorMessage,
        }"
        :style="{
          backgroundColor: `#${modelValue || 'fff'}`,
        }"
      />
      <input
        :value="modelValue"
        class="input-field"
        :class="{
          'input-field-disabled': disabled,
          'input-error': !!errorMessage,
        }"
        type="text"
        :placeholder="placeholder"
        spellcheck="false"
        :disabled="disabled ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        @input="input"
        @blur="onBlur"
      />
    </div>
    <p v-if="description" class="input-description">
      {{ description }}
    </p>
    <p
      v-if="errorMessage"
      data-test="input-error-message"
      class="input-error-message"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { isHexColor } from "validator";
import { type FormBasePropsV2 as FormBaseProps } from "./input/formBaseProps";
import type { FormInputBinds } from "./input/formInputBind";

const props = withDefaults(defineProps<FormBaseProps & FormInputBinds>(), {
  label: "Color",
  placeholder: "abcdef",
  required: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", event: string): void;
  (e: "update:error", event: string | null): void;
}>();

const InvalidColorCodeErrorMessage = "Please enter a valid color code.";
const touched = ref(false);
const errorMessage = ref<string | null>(null);

watch(
  () => props.error,
  (newError) => {
    errorMessage.value = newError ?? null;
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (value) => {
    // clear error instantly on valid
    if (errorMessage.value && !getError(value)) validate(value);
  },
);

watchDebounced(
  () => props.modelValue,
  (value) => {
    if (!touched.value) return;
    validate(value);
  },
  {
    debounce: 600,
  },
);

function input(event: Event) {
  const target = event.target as HTMLInputElement;
  touched.value = true;
  emit("update:modelValue", target.value);
}

function onBlur() {
  validate(props.modelValue);
}

function getError(value?: string | null) {
  if (!value) return props.required ? "Required" : null;
  return isHexColor(value) ? null : InvalidColorCodeErrorMessage;
}

function validate(value?: string | null) {
  errorMessage.value = getError(value);
  emit("update:error", errorMessage.value);
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

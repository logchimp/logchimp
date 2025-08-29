<template>
  <label class="input">
    <p
      v-if="label"
      data-test="input-field-label"
      class="input-field-label"
    >
      {{ label }}
    </p>
    <input
      :type="type"
      data-test="input-field"
      class="input-field input-text"
      :class="{
        'input-field-disabled': disabled,
        'input-error': error.show
      }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="input"
      @click="hideError"
      @keyup.enter="keyUpEnter"
      @keyup="keyup"
    >
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
  </label>
</template>

<script setup lang="ts">
import type { FormFieldErrorType } from "./formBaseProps";
import { formBaseProps } from "./formBaseProps";
import { formInputBind } from "./formInputBind";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  ...formBaseProps,
  ...formInputBind,
});

const emit = defineEmits<{
  (e: "hide-error", event: FormFieldErrorType): void;
  (e: "keyup-enter", event: KeyboardEvent): void;
  (e: "keyup", event: KeyboardEvent): void;
  (e: "update:modelValue", event: string): void;
}>();

function input(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}

function hideError() {
  emit("hide-error", {
    show: false,
    message: "",
  });
}

function keyUpEnter(event: KeyboardEvent) {
  if (props.disabled) return;
  emit("keyup-enter", event);
}

function keyup(event: KeyboardEvent) {
  if (props.disabled) return;
  emit("keyup", event);
}
</script>

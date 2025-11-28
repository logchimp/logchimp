<template>
  <label class="input">
    <p v-if="label" class="input-field-label">{{ label }}</p>
    <textarea
      :value="modelValue"
      class="input-field input-textarea"
      :class="{
        'input-field-disabled': disabled
      }"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      @input="input"
      ref="textareaRef"
    />
    <p v-if="error.show" class="input-error-message">{{ error.message }}</p>
  </label>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { formBaseProps } from "./formBaseProps";
import { formInputBind } from "./formInputBind";

defineProps({
  rows: {
    type: String,
    default: "3",
  },
  ...formBaseProps,
  ...formInputBind,
});

const emit = defineEmits(["update:modelValue"]);

function input(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}

const textareaRef = ref<HTMLTextAreaElement | null>(null);
function focus() {
  textareaRef.value?.focus();
}

defineExpose({ focus });
</script>

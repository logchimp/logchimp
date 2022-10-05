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
    />
    <p v-if="error.show" class="input-error-message">{{ error.message }}</p>
  </label>
</template>

<script setup lang="ts">
import { formBaseProps } from "./formBaseProps";
import { formInputBind } from "./formInputBind";

defineProps({
	rows: {
		type: String,
		default: "3"
	},
	...formBaseProps,
	...formInputBind
})

const emit = defineEmits(['update:modelValue'])

function input(event: any) {
	emit('update:modelValue', event.target.value)
}
</script>

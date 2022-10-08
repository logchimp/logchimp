<template>
  <div
    class="toggle"
    data-test="toggle"
    :style="{
      backgroundColor: modelValue ? `var(--brand-color)` : `#999`,
      justifyContent: modelValue ? `flex-end` : ''
    }"
  >
    <div class="toggle-slider" />
    <input
      type="checkbox"
      data-test="toggle-checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @input="click"
    >
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
	checked: {
		type: Boolean,
		default: false
	},
	disabled: {
		type: Boolean,
		default: false
	},
	modelValue: {
		type: Boolean,
		default: false,
	}
})

const emit = defineEmits<{
	(e: 'update:modelValue', event?: any): void
}>()

// TODO: Add TS types
function click(value: any) {
	// if (props.disabled) return;
	emit("update:modelValue", value.target.checked);
}
</script>

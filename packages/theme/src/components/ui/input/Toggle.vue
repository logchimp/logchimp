<template>
  <div
    class="toggle"
    data-test="toggle"
    :aria-disabled="disabled ? 'true' : undefined"
    :style="{
      backgroundColor: modelValue ? `var(--color-brand-color)` : `#999`,
      justifyContent: modelValue ? `flex-end` : ''
    }"
    :class="{
      'opacity-60': disabled
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
defineProps({
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

<style lang='sass'>
.toggle
	position: relative
	width: 2.5rem
	height: 1.5rem
	border-radius: 1rem
	display: flex
	cursor: pointer

	input
		cursor: pointer
		position: absolute
		opacity: 0
		width: 100%
		height: 100%

.toggle-slider
	width: 1.125rem
	height: 1.125rem
	background-color: var(--color-white)
	border-radius: 1rem
	margin: 3px
</style>

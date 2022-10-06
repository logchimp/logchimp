<template>
  <div
    class="toggle"
    data-test="toggle"
    :style="{
      backgroundColor: checked ? `var(--brand-color)` : `#999`,
      justifyContent: checked ? `flex-end` : ''
    }"
  >
    <div class="toggle-slider" />
    <input
      type="checkbox"
      data-test="toggle-checkbox"
      :checked="checked"
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
	}
})

const emit = defineEmits(['input'])

// TODO: Add TS types
function click(value: any) {
	if (props.disabled) return;
	emit("input", value.target.checked);
}
</script>

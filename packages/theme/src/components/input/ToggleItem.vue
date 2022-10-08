<template>
  <div class="toggle-item">
    <div class="toggle-item-row">
      <label data-test="toggle-item-label">{{ label }}</label>
      <toggle
        ref="toggleRefs"
        v-model="modelValue"
        :disabled="disabled"
        @input="input"
      />
    </div>
    <p
      v-if="note"
      data-test="toggle-item-note"
      class="toggle-item-note"
    >
      {{ note }}
    </p>
  </div>
</template>

<script setup lang="ts">
// components
import Toggle from "./Toggle.vue";

const props = defineProps({
	label: {
		type: String,
		required: true
	},
	note: {
		type: String,
		default: ""
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
function input(event: any) {
	// if (props.disabled) return;
	emit("update:modelValue", event.target.checked);
}
</script>

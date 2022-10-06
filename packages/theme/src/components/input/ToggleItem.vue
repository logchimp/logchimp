<template>
  <div class="toggle-item">
    <div class="toggle-item-row">
      <label data-test="toggle-item-label">{{ label }}</label>
      <toggle
        ref="toggleRefs"
        :checked="value"
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
	value: {
		type: Boolean,
		default: false
	},
	note: {
		type: String,
		default: ""
	},
	disabled: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['input'])

// TODO: Add TS types
function input(event: any) {
	if (props.disabled) return;
	// props.check = event;
	emit("input", event);
}
</script>

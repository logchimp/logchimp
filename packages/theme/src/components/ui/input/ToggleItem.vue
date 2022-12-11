<template>
  <div
    class="toggle-item"
    :class="{
      'opacity-60': disabled
    }"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div class="toggle-item-row">
      <label
        data-test="toggle-item-label"
        :class="{
          'cursor-pointer': !disabled
        }"
      >
        {{ label }}
      </label>
      <toggle
        ref="toggleRefs"
        :modelValue="modelValue"
        :disabled="disabled"
        @update:modelValue="input"
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

function input(checked: boolean) {
	emit("update:modelValue", checked);
}
</script>

<style lang='sass'>
.toggle-item
	&:not(:last-child)
		margin-bottom: 1rem

.toggle-item-row
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: 0.5rem

	label
		font-weight: 500
		user-select: none

.toggle-item-note
	font-size: 0.875rem
	color: var(--color-gray-50)
</style>

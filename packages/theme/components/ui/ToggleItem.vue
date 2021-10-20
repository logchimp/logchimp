<template>
	<div class="toggle-item">
		<div class="toggle-item-row">
			<label data-test="toggle-item-label">{{ label }}</label>
			<toggle
				ref="toggleRefs"
				:checked="value"
				:disabled="disabled"
				@input="emit"
			/>
		</div>
		<p v-if="note" data-test="toggle-item-note" class="toggle-item-note">
			{{ note }}
		</p>
	</div>
</template>

<script>
// components
import Toggle from "./Toggle";

export default {
	name: "ToggleItem",
	components: {
		Toggle
	},
	props: {
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
	},
	methods: {
		emit(event) {
			if (this.disabled) return;
			this.check = event;
			this.$emit("input", event);
		}
	}
};
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
		cursor: pointer
		user-select: none

.toggle-item-note
	font-size: 0.875rem
	color: var(--color-gray-50)
</style>

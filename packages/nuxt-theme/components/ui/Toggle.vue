<template>
	<div
		class="toggle"
		data-test="toggle"
		:style="{
			backgroundColor: checked ? `var(--color-brand-color)` : `#999`,
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
		/>
	</div>
</template>

<script>
export default {
	name: "Toggle",
	props: {
		checked: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		click(value) {
			if (this.disabled) return;
			this.$emit("input", value.target.checked);
		}
	}
};
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

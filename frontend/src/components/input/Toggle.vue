<template>
	<div
		class="toggle"
		:style="{
			backgroundColor: checked ? `var(--brand-color)` : `#999`,
			justifyContent: checked ? `flex-end` : ''
		}"
	>
		<div class="toggle-slider" />
		<input
			type="checkbox"
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

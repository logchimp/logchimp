<template>
	<div class="input">
		<label class="input-field-label" for="accent-color">Color</label>
		<div class="color-input">
			<div
				class="color-preview"
				:class="{
					'input-error': error.show
				}"
				:style="{
					backgroundColor: `#${value}`
				}"
			/>
			<input
				:value="value"
				class="input-field"
				:class="{
					'input-error': error.show
				}"
				type="text"
				placeholder="abcdef"
				spellcheck="false"
				@input="$emit('input', $event.target.value)"
				@click="hideError"
			/>
		</div>
		<p
			v-if="error.show"
			data-test="input-error-message"
			class="input-error-message"
		>
			{{ error.message }}
		</p>
	</div>
</template>

<script>
export default {
	name: "ColorInput",
	props: {
		value: {
			type: String,
			default: ""
		}
	},
	data() {
		return {
			error: {
				show: false,
				message: "The color should be in valid hex format."
			}
		};
	},
	watch: {
		value: function (newValue) {
			const validColor = /^[0-9A-F]{6}$/i.test(newValue);
			if (!validColor) this.error.show = true;
			else this.error.show = false;
		}
	},
	methods: {
		hideError() {
			this.error.show = false;
		}
	}
};
</script>

<style lang='sass'>
.color-input
	display: flex
	position: relative

	&::after
		content: "#"
		position: absolute
		top: 0.75rem
		left: 3.2rem
		color: var(--color-gray-70)
		font-family: inherit
		font-size: 0.875rem

	.input-field
		border-left: 0
		border-top-left-radius: 0
		border-bottom-left-radius: 0
		padding-left: 1.626rem

.color-preview
	width: 2.5rem
	height: 2.5rem
	border: 1px solid var(--color-gray-90)
	border-radius: var(--border-radius-default)
	border-top-right-radius: 0
	border-bottom-right-radius: 0
</style>

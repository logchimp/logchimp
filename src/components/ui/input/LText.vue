<template>
	<div class="input">
		<p v-if="label" class="input__field-label">{{ label }}</p>
		<input
			:type="type"
			class="input__field input__text"
			:class="{
				'input__field-disabled': disabled,
				'input__error': error.show
			}"
			:value="value"
			@input="$emit('input', $event.target.value)"
			@keydown="$emit('keydown')"
			:placeholder="placeholder"
			:disabled="disabled"
		/>
		<p v-if="error.show" class="input__error-message">{{ error.message }}</p>
	</div>
</template>

<script>
export default {
	name: "LText",
	props: {
		label: {
			type: String,
			default: ""
		},
		type: {
			type: String,
			default: "text"
		},
		placeholder: {
			type: String,
			default: ""
		},
		value: {
			type: String,
			default: ""
		},
		disabled: {
			type: Boolean,
			default: false
		},
		error: {
			type: Object,
			default: () => {
				return {
					show: false,
					message: ""
				};
			}
		}
	}
};
</script>

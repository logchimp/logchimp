<template>
	<div class="input">
		<p v-if="label" class="input__field-label">{{ label }}</p>
		<textarea
			:value="value"
			class="input__field input__textarea"
			:class="{
				'input__field-disabled': disabled
			}"
			@input="$emit('input', $event.target.value)"
			:placeholder="placeholder"
			:disabled="disabled"
		/>
		<p v-if="error.show" class="input__error-message">{{ error.message }}</p>
	</div>
</template>

<script>
export default {
	name: "LTextarea",
	props: {
		label: {
			type: String,
			default: ""
		},
		value: {
			type: String,
			default: ""
		},
		placeholder: {
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

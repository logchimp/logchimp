<template>
	<div class="input">
		<p v-if="label" class="input-field-label">{{ label }}</p>
		<textarea
			:value="value"
			class="input-field input-textarea"
			:class="{
				'input-field-disabled': disabled
			}"
			@input="$emit('input', $event.target.value)"
			:placeholder="placeholder"
			:disabled="disabled"
		/>
		<p v-if="error.show" class="input-error-message">{{ error.message }}</p>
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

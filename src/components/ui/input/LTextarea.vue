<template>
	<div>
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
		}
	}
};
</script>

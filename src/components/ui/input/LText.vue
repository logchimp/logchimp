<template>
	<div class="input">
		<p v-if="label" class="input__field-label">{{ label }}</p>
		<input
			:type="type"
			class="input__field input__text"
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
		disabled: {
			type: Boolean,
			default: false
		}
	}
};
</script>

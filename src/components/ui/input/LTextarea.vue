<template>
	<textarea
		:value="value"
		class="input__field input__textarea"
		:class="{
			'input__field-disabled': disabled
		}"
		@input="$emit('input', $event.target.value)"
	/>
</template>

<script>
export default {
	name: "LTextarea",
	props: {
		type: {
			type: String,
			default: "text"
		},
		value: {
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

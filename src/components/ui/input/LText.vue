<template>
	<input
		:type="type"
		class="input__field input__text"
		:class="{
			'input__field-disabled': disabled
		}"
		@input="$emit('input', $event.target.value)"
		:disabled="disabled"
	/>
</template>

<script>
export default {
	name: "LText",
	props: {
		type: {
			type: String,
			default: "text"
		},
		disabled: {
			type: Boolean,
			default: false
		}
	}
};
</script>

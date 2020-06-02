<template>
	<input
		:type="type"
		class="input__field input__text"
		:class="{
			'input__text-disabled': disabled
		}"
		@input="$emit('input', $event.target.value)"
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

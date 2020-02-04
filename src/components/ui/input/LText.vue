<template>
	<input
		:type="type"
		class="input__text"
		:class="{
			'disabled': disabled
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

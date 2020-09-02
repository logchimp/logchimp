<template>
	<form
		class="form__container"
		:method="method"
		:id="id"
		:autocomplete="autocomplete"
	>
		<slot />
	</form>
</template>

<script>
export default {
	name: "Form",
	props: {
		method: {
			type: String,
			required: true
		},
		id: {
			type: String,
			required: true
		},
		autocomplete: {
			type: String,
			required: true,
			default: "off"
		}
	}
};
</script>

<style lang="sass">
.form__container
	padding: 2rem
	border: 1px solid $gray-90
	border-radius: $border-radius
	display: flex
	flex-direction: column
	align-items: center
</style>

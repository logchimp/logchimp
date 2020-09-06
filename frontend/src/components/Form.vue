<template>
	<div class="form__container">
		<slot />
	</div>
</template>

<script>
export default {
	name: "Form"
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

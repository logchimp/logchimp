<template>
	<div class="button" :class="[`button__${type}`]">
		<slot />
	</div>
</template>

<script>
export default {
	name: "Button",
	props: {
		type: {
			type: String,
			required: true
		}
	}
};
</script>

<style lang="sass">
.button
	position: relative
	padding: .875rem 1.5rem
	border-radius: $border-radius
	font-weight: 500
	display: flex
	justify-content: center
	cursor: pointer
	user-select: none

.button__primary
	background-color: $brand-color
	color: $white

.button__outline
	border: 1px solid rgba($white, .5)

	&:hover
		border-color: $white

.button__primary-disabled
	opacity: .7
	cursor: default
</style>

<template>
	<div class="button" :class="[`button__${type}`]" @click="$emit('click')">
		<slot />
		<div class="button__loader" v-if="loading">
			<loader-icon />
		</div>
	</div>
</template>

<script>
// icons
import LoaderIcon from "./icons/Loader";

export default {
	name: "Button",
	props: {
		type: {
			type: String,
			required: true
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	components: {
		LoaderIcon
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

.button__loader
	border-radius: $border-radius
	display: flex
	justify-content: center
	align-items: center
	width: 100%
	height: 100%
	position: absolute
	top: 0
	bottom: 0
	left: 0
	right: 0
	background-color: $brand-color
	cursor: default

	svg
		width: 1.5rem
		height: 1.5rem
		stroke: $white
		animation-name: spinner
		animation-duration: 1.1s
		animation-direction: normal
		animation-timing-function: linear
		animation-iteration-count: infinite

@keyframes spinner
  0%
    transform: rotate(0deg)

  100%
    transform: rotate(360deg)

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

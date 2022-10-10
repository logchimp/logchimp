<template>
	<div class="loader">
		<loader-icon />
	</div>
</template>

<script setup lang="ts">
// icons
import LoaderIcon from "../icons/Loader.vue";
</script>

<style lang='sass'>
.loader
	display: flex

	svg
		width: 1.5rem
		height: 1.5rem
		stroke: var(--color-gray-80)
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
</style>

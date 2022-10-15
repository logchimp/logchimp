<template>
	<div class="server-error">
		<span>
			Something went wrong! Please try again or contact the site owner.
		</span>
		<close-icon @click.native="$emit('close')" />
	</div>
</template>

<script lang="ts">
export default {
	name: "ServerError",
};
</script>

<script setup lang="ts">
// packages
import { X as CloseIcon } from "lucide-vue";
</script>

<style lang='sass'>
.server-error
	padding: 0.875rem
	border-radius: var(--border-radius-default)
	background-color: var(--color-color-danger-light)
	display: flex
	align-items: center
	justify-content: space-between
	margin-bottom: 1rem

	span
		color: var(--color-color-danger)
		font-weight: 500
		font-size: 0.875rem
		line-height: 1.3

	svg
		stroke: var(--color-color-danger)
		cursor: pointer
		margin-left: 1rem
</style>

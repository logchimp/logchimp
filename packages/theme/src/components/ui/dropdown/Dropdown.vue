<template>
  <div
    class="dropdown"
    :style="style"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
	height: {
		type: Number,
		default: 0
	}
})

const style = computed(() => {
	return [
		props.height ? `max-height: ${props.height}px` : '',
		props.height ? 'overflow-y: auto' : ''
	]
})
</script>

<style lang='sass'>
.dropdown
	background-color: var(--color-white)
	position: absolute
	border: 1px solid var(--color-gray-90)
	border-radius: var(--border-radius-default)
	padding: 0.375rem 0
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06)
	z-index: 8

// dropdown direction
.dropdown.sw
	right: 0
</style>

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

<template>
	<div
		class="dropdown-item"
		:class="{
			'dropdown-item-disabled': disabled
		}"
		@click="click"
	>
		<div v-if="isIcon" class="dropdown-item-icon">
			<slot name="icon" />
		</div>
		<div class="dropdown-item-content">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

const props = defineProps({
	disabled: {
		type: Boolean,
		default: false
	}
})

const isIcon = computed(() => useSlots().icon)

const emit = defineEmits<{
	(e: 'click', event?: any): void
}>();

function click() {
	if (props.disabled) return;
	emit("click");
}
</script>

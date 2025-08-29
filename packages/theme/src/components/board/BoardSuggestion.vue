<template>
	<div class="board-suggestion" @click="$emit('click')">
    <color-dot :color="board.color" />
		<div class="board-suggestion-content">
			<h5 data-test="board-suggestion-name">
				{{ board.name }}
			</h5>
			<span data-test="board-suggestion-url">{{ board.url }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { IBoardPrivate, IRoadmapPrivate } from "@logchimp/types";
import ColorDot from "../ui/ColorDot/ColorDot.vue";

interface Props {
  board: IBoardPrivate | IRoadmapPrivate;
}

defineProps<Props>();
</script>

<style lang='sass'>
.board-suggestion
	display: flex
	align-items: center
	padding: 0.75rem 1rem
	background-color: var(--color-white)
	cursor: pointer
	margin: 0 0.375rem
	border-radius: var(--border-radius-default)

	&:hover
		background-color: var(--color-gray-97)

.board-suggestion-content
	margin-left: 1.5rem

	h5
		margin-bottom: 0

	span
		color: var(--color-gray-60)
</style>

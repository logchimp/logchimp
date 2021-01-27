<template>
	<div class="board-suggestion" @click="$emit('click')">
		<div
			class="color-dot"
			:style="{
				backgroundColor: `#${board.color}`
			}"
		/>
		<div class="board-suggestion-content">
			<h5>{{ board.name }}</h5>
			<span>{{ board.url }}</span>
		</div>
	</div>
</template>

<script>
export default {
	name: "BoardSuggestion",
	props: {
		board: {
			type: Object,
			default: () => {}
		}
	}
};
</script>

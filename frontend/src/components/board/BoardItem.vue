<template>
	<router-link
		data-test="board-item"
		:to="`/board/${url}`"
		class="board-item"
	>
		<div
			class="color-dot"
			data-test="board-item-color"
			:style="{
				backgroundColor: `#${color}`
			}"
		/>
		<div class="board-item-name-and-posts">
			<div data-test="board-item-name" class="board-item-name">
				{{ name }}
			</div>
			<div data-test="board-item-postcount" class="board-item-postcount">
				{{ postCount }}
			</div>
		</div>
	</router-link>
</template>

<script>
export default {
	name: "BoardItem",
	props: {
		name: {
			type: String,
			required: true
		},
		color: {
			type: String,
			validator: value => {
				return value.length === 6;
			}
		},
		url: {
			type: String
		},
		postCount: {
			type: Number,
			default: 0
		}
	}
};
</script>

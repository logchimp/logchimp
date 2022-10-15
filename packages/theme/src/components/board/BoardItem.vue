<template>
  <router-link
    data-test="board-item"
    :to="`/boards/${url}`"
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

<script setup lang="ts">
defineProps({
	name: {
		type: String,
		required: true
	},
	color: {
		type: String,
		required: true,
		validator: (value: string) => {
			return value.length === 6;
		}
	},
	url: {
		type: String,
		required: true
	},
	postCount: {
		type: Number,
		default: 0
	}
})
</script>

<style lang='sass'>
.board-item
	display: flex
	align-items: center
	padding: 1rem
	background-color: var(--color-gray-97)
	border-radius: var(--border-radius-default)
	user-select: none

	&:hover
		background-color: var(--color-gray-95)

.board-item-name-and-posts
	margin-left: 0.625rem
	display: flex
	justify-content: space-between
	align-items: center
	width: 100%

.board-item-name
	color: var(--color-gray-40)
	font-weight: 500

.board-item-postcount
	color: var(--color-gray-60)
	font-size: 0.875rem
	font-weight: 600
	margin-left: 1rem
</style>

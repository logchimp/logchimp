<template>
	<div class="avatar-stack -space-x-3.5">
		<img
			v-for="avatar in avatars"
			:key="avatar.userId"
			data-test="avatar-stack-image"
			class="avatar-stack-image"
			:src="avatar.avatar"
			:alt="avatar.username"
		>
		<div
			v-if="!hideMoreStack"
			data-test="avatar-stack-more"
			class="avatar-stack-more"
		>
			{{ "+" + moreStack }}
		</div>
	</div>
</template>

<script lang="ts">
interface AvatarType {
	userId: string
	avatar: string
	username?: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	avatars: AvatarType[]
	totalCount: number
}>()

const hideMoreStack = computed(() => {
	return props.totalCount <= 6;
});

const moreStack = computed(() => {
	return props.totalCount - 6;
})
</script>

<style lang='sass'>
.avatar-stack
	display: flex
	user-select: none

	img
		border-radius: 1rem
		border: 1px solid var(--color-white)
		width: 2rem
		height: 2rem

.avatar-stack-more
	border-radius: 1rem
	border: 1px solid var(--color-white)
	background-color: var(--color-gray-95)
	padding: 0 0.375rem
	min-width: 2rem
	height: 2rem
	font-size: 0.75rem
	font-weight: 500
	color: var(--color-gray-60)
	display: flex
	align-items: center
	justify-content: center
</style>

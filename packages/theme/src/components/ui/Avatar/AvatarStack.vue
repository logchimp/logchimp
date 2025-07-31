<template>
	<div class="flex select-none -space-x-3.5">
		<img
			v-for="avatar in avatars"
			:key="avatar.userId"
			data-test="avatar-stack-image"
			class="pointer-events-none border border-(--color-white) min-w-8 min-h-8 max-h-8 max-w-8 rounded-full"
			:src="avatar.avatar"
			:alt="avatar.username"
		>
		<div
			v-if="!hideMoreStack"
			data-test="avatar-stack-more"
			:class="[
        'border border-(--color-white) bg-(--color-gray-95) rounded-full',
        'min-w-8 min-h-8 flex items-center justify-center',
        'text-xs font-medium text-(--color-gray-60) px-1.5'
			]"
		>
			{{ "+" + moreStack }}
		</div>
	</div>
</template>

<script lang="ts">
interface AvatarType {
  userId: string;
  avatar: string;
  username?: string;
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

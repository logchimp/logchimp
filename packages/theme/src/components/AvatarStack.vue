<template>
  <div class="avatar-stack">
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

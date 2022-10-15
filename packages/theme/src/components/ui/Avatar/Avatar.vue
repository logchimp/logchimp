<template>
  <div class="avatar" @click="$emit('click')">
    <div
      v-if="src"
      data-test="avatar-image"
      class="avatar-image"
    >
      <img
        :src="src"
        :alt="name"
        class="avatar-image-img"
      >
    </div>
    <div
      v-else
      data-test="avatar-initials"
      class="avatar-initials"
    >
      {{ initals }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
	src: {
		type: String,
		default: ""
	},
	name: {
		type: String,
		required: true
	}
});

const initals = computed(() => {
	return props.name.slice(0, 1);
})
</script>

<style lang='sass'>
.avatar
	user-select: none

.avatar-image, .avatar-initials
	display: flex
	max-width: 100%
	max-height: 100%
	height: 2rem
	width: 2rem

.avatar-image-img
	width: 100%
	max-width: 2rem
	border-radius: 1rem

.avatar-initials
	align-items: center
	justify-content: center
	background-color: var(--color-brand-color)
	border-radius: 1rem
	color: var(--color-white)
	border: 1px solid var(--color-white)
	font-weight: 500
	text-transform: uppercase
</style>

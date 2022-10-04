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

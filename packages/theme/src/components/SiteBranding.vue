<template>
  <router-link :to="link" class="site-info">
    <div class="logo-placeholder">
      <img
        class="site-logo"
        :src="logo"
        :alt="title"
      >
    </div>
    <h5 v-if="title" class="site-name">
      {{ title }}
    </h5>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	logo: {
		type: String,
		required: true,
	},
	dashboard: {
		type: Boolean,
		default: false
	}
})

const link = computed(() =>  props.dashboard ? "/dashboard" : "/")
</script>

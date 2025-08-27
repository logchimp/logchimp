<template>
	<router-link :to="link" class="flex items-center gap-x-2.5 select-none">
		<div v-if="logo" class="size-7 bg-neutral-100 rounded-full overflow-hidden">
			<img
        class="size-7 rounded-full"
				:src="logo"
				:alt="title || undefined"
			>
		</div>
		<p
			v-if="title"
			:class="{
        'font-semibold text-lg': true,
				'text-neutral-800': textColor === 'black',
				'text-white': textColor === 'white'
			}"
		>
			{{ title }}
		</p>
	</router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  title: {
    type: [String, null],
    required: true,
  },
  logo: {
    type: [String, null],
    required: true,
  },
  dashboard: {
    type: Boolean,
    default: false,
  },
  textColor: {
    type: String,
    default: "black",
    validator: (value: "white" | "black") => ["white", "black"].includes(value),
  },
});

const link = computed(() => (props.dashboard ? "/dashboard" : "/"));
</script>

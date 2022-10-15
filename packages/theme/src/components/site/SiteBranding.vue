<template>
	<router-link :to="link" :class="$style.branding">
		<div :class="$style.placeholder">
			<img :class="$style.image"
				:src="logo"
				:alt="title"
			>
		</div>
		<h5
			v-if="title"
			:class="{
				[$style.name]: true,
				[$style['name-black']]: textColor === 'black',
				[$style['name-white']]: textColor === 'white'
			}"
		>
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
	},
	textColor: {
		type: String,
		default: "black",
		validator: (value: 'white' | 'black') => ['white', 'black'].includes(value)
	}
})

const link = computed(() =>  props.dashboard ? "/dashboard" : "/")
</script>

<style lang='sass' module>
.branding
	--logo-size: 2rem
	display: flex
	align-items: center
	user-select: none

.placeholder
	width: var(--logo-size)
	height: var(--logo-size)
	background-color: var(--color-gray-97)
	border-radius: 3rem
	cursor: pointer
	user-select: none

.image
	width: var(--logo-size)

.name
	margin-left: 0.625rem
	margin-bottom: 0

.name-black
	color: var(--color-text-black)

.name-white
	color: var(--color-white)
</style>

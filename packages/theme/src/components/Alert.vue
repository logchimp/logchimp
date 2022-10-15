<template>
  <div
    class="alert-item"
    :style="{
      animationDuration: timeout / 1000 + 's'
    }"
  >
    <div
      class="alert-item-type"
      :class="{
        'alert-type-error': type === 'error',
        'alert-type-success': type === 'success',
        'alert-type-warning': type === 'warning'
      }"
    />
    <div class="alert-item-content">
      <!-- <div class="alert-item-icon">
				<Success
					v-if="type === 'success'"
					class="alert-icon alert-icon-success"
				/>
				<Warning
					v-if="type === 'warning'"
					class="alert-icon alert-icon-warning"
				/>
				<Error v-if="type === 'error'" class="alert-icon alert-icon-error" />
			</div> -->
      <div class="alert-item-title">
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import Success from "./icons/Success";
// import Warning from "./icons/Warning";
// import Error from "./icons/Error";
import { onMounted } from 'vue';

const props = defineProps({
	title: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	timeout: {
		type: Number,
		required: true,
		default: 2000
	}
})

const emit = defineEmits(['remove'])

onMounted(() => {
	setTimeout(() => emit("remove"), props.timeout);
})
</script>

<style lang='sass'>
.alert-item
	background-color: var(--color-white)
	border-radius: var(--border-radius-default)
	padding: 0.625rem 1rem 0.625rem 0.625rem
	display: flex
	width: 100%
	max-width: 250px
	margin-bottom: 1rem
	box-shadow: 2px 4px 20px 2px rgba(0, 0, 0, 0.12)
	animation-name: alertfade
	animation-timing-function: linear

	&-content
		padding: 0.5rem 0
		display: flex
		align-items: center

	&-icon
		display: flex
		margin-right: 0.75rem

	&-type
		width: 4px
		border-radius: var(--border-radius-default)
		margin-right: 1rem

	&-title
		font-weight: 600

.alert-type-success
	background-color: var(--color-color-success)

.alert-type-warning
	background-color: var(--color-color-warning)

.alert-type-error
	background-color: var(--color-color-danger)

.alert-icon
	width: 2rem
	height: 2rem

	&-success
		fill: var(--color-color-success)
		stroke: var(--color-white)

	&-warning
		fill: var(--color-color-warning)
		stroke: var(--color-white)

	&-error
		fill: var(--color-color-danger)
		stroke: var(--color-white)

@keyframes alertfade
	0%
		opacity: 1
	60%
		opacity: 1
	80%
		opacity: 0.5
	100%
		opacity: 0
</style>

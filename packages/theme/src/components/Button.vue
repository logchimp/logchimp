<template>
  <div
    class="button"
    :class="[
      `button-${type}`,
      loading ? 'button-loading' : '',
      disabled ? 'button-primary-disabled' : ''
    ]"
    @click="click"
  >
    <slot />
    <div v-if="loading" class="button-loader">
      <loader-icon />
    </div>
  </div>
</template>

<script setup lang="ts">
// icons
import LoaderIcon from "./icons/Loader.vue";

const props = defineProps({
	type: {
		type: String,
		required: true
	},
	loading: {
		type: Boolean,
		default: false
	},
	disabled: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['click'])

function click() {
	if (props.loading) return;
	if (props.disabled) return;
	emit("click");
}
</script>

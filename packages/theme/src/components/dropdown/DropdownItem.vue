<template>
  <div
    class="dropdown-item"
    :class="{
      'dropdown-item-disabled': disabled
    }"
    @click="click"
  >
    <div class="dropdown-item-icon">
      <slot name="icon" />
    </div>
    <div class="dropdown-item-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
	disabled: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['click']);

function click() {
	if (props.disabled) return;
	emit("click");
}
</script>

<template>
  <div
		class="dropdown-wrapper"
		@click="click"
  >
	<!-- v-on-clickaway="away" -->
    <slot name="toggle" />
    <slot :active="active" />
  </div>
</template>

<script setup lang="ts">
// packages
import { ref } from 'vue';
// import { mixin as clickaway } from "vue-clickaway";

const active = ref<boolean>(false);

const props = defineProps({
    disabled: {
      type: Boolean,
      default: false
    }
  });

function click() {
	if (props.disabled) return;
	active.value = !active.value;
};

function away() {
	active.value = false;
}

// mixins: [clickaway],
</script>

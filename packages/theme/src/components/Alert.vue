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

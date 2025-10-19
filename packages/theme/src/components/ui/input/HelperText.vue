<template>
  <div
    class="text-sm text-right"
    :class="{'text-neutral-700': remaining >= 0,
      'text-red-600': remaining < 0
    }"
  >
  <slot>
   {{ remaining }}
  </slot>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  value: {
    type: String,
    default: "",
    required: true,  
  },
  maxLength: {
    type: Number,
    default: 0,
    required: true,
  }
});

const valueLength = props.value?.length || 0;
const remaining = props.maxLength - valueLength;
</script>

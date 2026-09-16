<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from "reka-ui";
import { CheckIcon } from "lucide-vue";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <CheckboxRoot
    :model-value="modelValue"
    :disabled="disabled"
    :class="[
      'hover:bg-neutral-50 size-5 appearance-none',
      'flex items-center justify-center rounded-(--border-radius-default) border outline-none',
      'not-disabled:bg-white not-disabled:border-gray-400',
      'disabled:bg-gray-200/80 disabled:border-gray-300 disabled:cursor-not-allowed',
    ]"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <CheckboxIndicator
      class="size-full rounded flex items-center justify-center"
    >
      <CheckIcon class="size-4 text-gray-700 stroke-3" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

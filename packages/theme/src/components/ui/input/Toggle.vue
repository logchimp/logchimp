<template>
  <SwitchRoot
    :id="id"
    :class="[
      'toggle w-10 h-6 rounded-2xl relative overflow-hidden',
      'data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-(--color-brand-color) transition-[background]',
      // 'focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
    ]"
    data-test="toggle"
    :model-value="modelValue || checked"
    @update:modelValue="$emit('update:modelValue', $event)"
    :disabled="disabled"
    :required="required"
  >
    <SwitchThumb
      :class="[
        'size-[18px] my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full',
        'transition-transform translate-x-[3px] will-change-transform data-[state=checked]:translate-x-full'
      ]"
    />
  </SwitchRoot>
</template>

<script setup lang="ts">
import { SwitchRoot, SwitchThumb, type SwitchRootProps } from "reka-ui";

interface ToggleProps extends SwitchRootProps {
  // Kept for backward compatibility
  // TODO: Use `modelValue` props
  checked?: boolean;
}

withDefaults(defineProps<ToggleProps>(), {
  checked: false,
  disabled: false,
  modelValue: false,
  required: false,
});

defineEmits<(e: "update:modelValue", event: boolean) => void>();
</script>

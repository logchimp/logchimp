<template>
  <div
    class="toggle-item"
    :class="{
      'opacity-60': disabled
    }"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div class="flex items-center justify-between">
      <label
        :for="id"
        data-test="toggle-item-label"
        class="select-none font-medium"
        :class="{
          'cursor-pointer': !disabled
        }"
      >
        {{ label }}
      </label>
      <toggle
        :id="id"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :disabled="disabled"
      />
    </div>
    <p
      v-if="note"
      data-test="toggle-item-note"
      class="mt-2 text-sm text-(--color-gray-50)"
    >
      {{ note }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useId, computed } from "vue";
import type { SwitchRootProps } from "reka-ui";
import Toggle from "./Toggle.vue";

interface ToggleItemProps extends SwitchRootProps {
  id?: string;
  label: string;
  note?: string;
}

const props = withDefaults(defineProps<ToggleItemProps>(), {
  disabled: false,
  modelValue: false,
  required: false,
});

const id = computed(() => props.id || useId());

defineEmits<(e: "update:modelValue", event: boolean) => void>();
</script>

<style lang='sass'>
.toggle-item
  &:not(:last-child)
    margin-bottom: 1rem
</style>

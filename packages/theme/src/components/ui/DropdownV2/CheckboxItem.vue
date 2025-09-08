<template>
  <DropdownMenuCheckboxItem
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :disabled="disabled"
    :class="[
      // styled copied from DropdownV2Item.vue
       'group text-sm rounded-md flex items-center gap-x-2.5 py-2 px-3 select-none outline-none',
      'hover:bg-neutral-200/70',
      // disabled
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-70',
    ]"
  >
    <div class="size-5">
      <DropdownMenuItemIndicator>
        <CheckIcon aria-hidden="true" class="size-5 stroke-neutral-700" />
      </DropdownMenuItemIndicator>
    </div>

    <slot />

    <!-- TODO: work on styles -->
    <div
      class="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8"
      v-if="$slots.shortcut"
    >
      <slot name="shortcut" />
    </div>
  </DropdownMenuCheckboxItem>
</template>

<script setup lang="ts">
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  type DropdownMenuCheckboxItemProps,
} from "reka-ui";
import { CheckIcon } from "lucide-vue";

withDefaults(defineProps<DropdownMenuCheckboxItemProps>(), {
  modelValue: false,
  disabled: false,
});

defineEmits<(e: "update:modelValue", event: boolean) => void>();

defineOptions({
  name: "DropdownV2CheckboxItem",
});
</script>

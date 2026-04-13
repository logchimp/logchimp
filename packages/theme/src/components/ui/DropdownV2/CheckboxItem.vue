<template>
  <DropdownMenuCheckboxItem
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    @pointerdown="onPointerDown"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @select="onSelect"
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
import { ref } from "vue";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  type DropdownMenuCheckboxItemProps,
} from "reka-ui";
import { CheckIcon } from "lucide-vue";

interface Props extends DropdownMenuCheckboxItemProps {
  keepOpenOnShift?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  keepOpenOnShift: false,
});

defineEmits<(e: "update:modelValue", event: boolean) => void>();

const shiftPressed = ref(false);

function onPointerDown(event: PointerEvent) {
  shiftPressed.value = event.shiftKey;
}

function onKeyDown(event: KeyboardEvent) {
  shiftPressed.value = event.shiftKey;
}

function onKeyUp(event: KeyboardEvent) {
  shiftPressed.value = event.shiftKey;
}

function onSelect(event: Event) {
  if (props.keepOpenOnShift && shiftPressed.value) {
    event.preventDefault();
  }
}

defineOptions({
  name: "DropdownV2CheckboxItem",
});
</script>

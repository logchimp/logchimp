<template>
  <DropdownMenuItem
    :class="[
      'flex items-center gap-x-4 px-4 py-1',
      'cursor-pointer outline-none',
      'bg-white hover:bg-neutral-300/50 data-[highlighted]:bg-neutral-300/50',
    ]"
    @click="$emit('select', suggestion)"
  >
    <div class="size-4 flex items-center justify-center">
      <color-dot :color="suggestion.color" class="size-3" />
    </div>
    <div>
      <div data-test="board-suggestion-name" class="text-md font-semibold">
        {{ suggestion.name }}
      </div>
      <p data-test="board-suggestion-url" class="text-xs text-neutral-500">{{ suggestion.url }}</p>
    </div>
  </DropdownMenuItem>
</template>

<script lang="ts">
interface SuggestionItem {
  id?: string;
  name: string;
  url: string;
  color: string;
}
</script>

<script setup lang="ts" generic="T extends SuggestionItem">
import { DropdownMenuItem } from "reka-ui";

import ColorDot from "../../components/ui/ColorDot/ColorDot.vue";

interface Props {
  suggestion: T;
}

defineProps<Props>();

defineEmits<(e: "select", value: T) => void>();
</script>

<template>
  <div>
    <DropdownV2 :open="isOpen" @update:open="onToggle" :model="false">
      <template #trigger>
        <DropdownMenuTrigger
          :class="[
            'group w-full px-4 outline-none select-none rounded-md',
            'border border-neutral-300 bg-white hover:bg-neutral-50 data-[state=open]:bg-neutral-50',
            'data-[state=open]:ring-4 data-[state=open]:ring-neutral-200/70',
            'text-left text-sm font-medium',
            'flex items-center justify-between gap-x-4',
            board?.boardId ? 'py-1.5' : 'py-2.5'
          ]"
          :disabled="disabled"
        >
          <template v-if="board?.boardId">
            <div class="flex items-center gap-x-4">
              <div class="size-4 flex items-center justify-center">
                <color-dot :color="board.color" class="size-3" />
              </div>
              <div>
                <div class="text-md font-semibold line-clamp-1">
                  {{board.name}}
                </div>
                <p class="text-xs text-neutral-500 line-clamp-1 leading-3">
                  {{board.url}}
                </p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="text-neutral-500">
              Select Board
            </div>
          </template>
          <ChevronDown
            aria-hidden="true"
            :class="['stroke-neutral-700 flex-shrink-0 size-6','group-data-[state=open]:rotate-180 transition duration-150']"
          />
        </DropdownMenuTrigger>
      </template>

      <SearchBoardDropdownContent :is-open="isOpen" />
    </DropdownV2>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { DropdownMenuTrigger } from "reka-ui";
import { ChevronDown } from "lucide-vue";

import { useBoardSearch, type TCurrentBoard } from "./search";

import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import SearchBoardDropdownContent from "./DropdownContent.vue";
import ColorDot from "../../../../../components/ui/ColorDot/ColorDot.vue";

const isOpen = ref<boolean>(false);
const { board, select, clear: clearBoardSearch } = useBoardSearch();

interface Props {
  disabled?: boolean;
  board: TCurrentBoard;
}
const emit = defineEmits<(e: "selected", value: TCurrentBoard) => void>();
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

function onToggle(e: boolean) {
  isOpen.value = e;
}

watch(board, (value: TCurrentBoard) => {
  isOpen.value = false;
  emit("selected", value);
});

onMounted(() => {
  clearBoardSearch();
  if (props.board) {
    select(props.board);
  }
});

defineOptions({
  name: "SearchBoardDropdown",
});
</script>

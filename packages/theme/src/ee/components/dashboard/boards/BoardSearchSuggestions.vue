<template>
  <div>
    <DropdownV2 :open="isOpen" @update:open="onToggle">
      <template #trigger>
        <DropdownMenuTrigger
          :class="[
            'group w-full px-3 py-2.5 outline-none select-none rounded-md',
            'border border-neutral-300 hover:border-neutral-400/70 data-[state=open]:border-neutral-400 focus-visible:border-neutral-400',
            'text-left text-sm font-medium',
            isSelected ? 'text-neutral-700' : 'text-neutral-400',
            'flex items-center justify-between'
          ]"
        >
          Select Board
          <ChevronDown
            aria-hidden="true"
            :class="['group-data-[state=open]:rotate-180 transition duration-150']"
          />
        </DropdownMenuTrigger>
      </template>

      <DropdownMenuContent
        :class="[
          'p-1 w-full max-h-[300px] overflow-y-auto',
          'shadow-sm border border-neutral-300 bg-white rounded-lg'
        ]"
        side="bottom"
        :loop="true"
        :side-offset="10"
        align="start"
      >
        <div class="pt-1.5 px-1.5">
          <l-text
            v-model="search"
            label="Boards"
            placeholder="Search boards"
            @input="suggestBoard"
          />
        </div>

        <ItemSuggestionDropdownItem
          v-for="item in suggestions"
          :key="item.boardId"
          :suggestion="item"
          @select="e => $emit('select', e)"
        />
      </DropdownMenuContent>
    </DropdownV2>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DropdownMenuContent, DropdownMenuTrigger } from "reka-ui";
import { ChevronDown } from "lucide-vue";
import type { IBoardPrivate } from "@logchimp/types";

import { searchBoard } from "../../../modules/boards";
import LText from "../../../../components/ui/input/LText.vue";
import ItemSuggestionDropdownItem from "../../ItemSuggestionDropdownItem.vue";
import DropdownV2 from "../../../../components/ui/DropdownV2/Dropdown.vue";

const isOpen = ref<boolean>(false);
const isSelected = ref<boolean>(false);
const search = ref("");
const suggestions = ref<IBoardPrivate[]>([]);

interface Props {
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});

defineEmits<(e: "select", value: IBoardPrivate) => void>();

async function suggestBoard(event: Event) {
  const target = event.target as HTMLInputElement;
  const name = target.value;
  if (!name) {
    search.value = "";
    suggestions.value = [];
    return;
  }

  try {
    const response = await searchBoard(name);
    suggestions.value = response.data.boards;
  } catch (err) {
    console.error(err);
  }
}

function onToggle(e: boolean) {
  isOpen.value = e;

  if (!e) {
    search.value = "";
    suggestions.value = [];
  }
}
</script>

<template>
  <DropdownMenuContent
    :class="[
      'w-(--reka-popper-anchor-width) max-h-60 overflow-y-auto',
      'shadow-sm border border-neutral-300 bg-white rounded-lg'
    ]"
    side="bottom"
    :loop="true"
    :side-offset="10"
    align="start"
  >
    <div class="border-b border-neutral-300 sticky top-0 bg-white">
      <input
        :id="searchInputId"
        v-model="search"
        placeholder="Search boards..."
        class="px-4 py-3 outline-none grow border-none sm:text-sm w-full"
        autocomplete="off"
        autocorrect="off"
        spellCheck="false"
        ref="searchInputRef"
      />
    </div>

    <div class="w-full">
      <NoBoard
        v-if="searchBoard.board"
        @select="selectHandler"
      />

      <ItemSuggestionDropdownItem
        v-for="item in suggestions"
        :key="item.boardId"
        :suggestion="item"
        @select="selectHandler"
      />

      <CreateBoardItem
        :search="search"
        :has-suggestions="suggestions.length > 0"
        @created="selectHandler"
      />
    </div>
  </DropdownMenuContent>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, useId, watch, nextTick } from "vue";
import { DropdownMenuContent } from "reka-ui";
import { watchDebounced } from "@vueuse/core";
import type { IBoardPrivate } from "@logchimp/types";

import { searchBoard as searchBoardApi } from "../../../../modules/boards";
import { type TCurrentBoard, useBoardSearch } from "./search";

import ItemSuggestionDropdownItem from "../../../ItemSuggestionDropdownItem.vue";
import NoBoard from "./NoBoard.vue";
import CreateBoardItem from "./CreateBoardItem.vue";

const search = ref("");
const suggestions = ref<IBoardPrivate[]>([]);
const searchInputId = useId();
const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");

interface Props {
  isOpen: boolean;
}
const props = defineProps<Props>();
const searchBoard = useBoardSearch();

watch(
  () => props.isOpen,
  (value: boolean) => {
    if (value) {
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    } else {
      search.value = "";
      resetSuggestions();
    }
  },
);

watchDebounced(
  search,
  async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      resetSuggestions();
      return;
    }

    try {
      const response = await searchBoardApi(searchTerm);
      suggestions.value = response.data.boards;
    } catch (err) {
      console.error(err);
      resetSuggestions();
    }
  },
  { debounce: 600 },
);

function selectHandler(e: TCurrentBoard) {
  searchBoard.select(e);
}

function resetSuggestions() {
  suggestions.value = [];
}

defineOptions({
  name: "SearchBoardDropdownContent",
});
</script>

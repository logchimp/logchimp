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
        placeholder="Search roadmaps..."
        class="px-4 py-3 outline-none grow border-none sm:text-sm w-full"
        autocomplete="off"
        autocorrect="off"
        spellCheck="false"
        ref="searchInputRef"
      />
    </div>

    <div class="w-full">
      <div
        v-if="!(searchRoadmap.roadmap.value?.url === 'uncategorized-roadmap') && !search"
        :class="[
          'gap-x-6 px-4 py-2.5 rounded-md text-center text-md font-semibold',
          'cursor-pointer outline-none',
          'bg-white hover:bg-neutral-300/50 data-[highlighted]:bg-neutral-300/50',
        ]"
        @click="selectHandler(noRoadmapTemplate)"
      >
        No Roadmap
      </div>

      <ItemSuggestionDropdownItem
        v-for="item in suggestions"
        :key="item.id"
        :suggestion="item"
        @select="selectHandler"
      />

      <CreateRoadmapItem
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
import type { IRoadmapPrivate } from "@logchimp/types";

import { searchRoadmap as searchRoadmapApi } from "../../../../../modules/roadmaps";
import { useRoadmapSearch } from "./search";

import ItemSuggestionDropdownItem from "../../../ItemSuggestionDropdownItem.vue";
import CreateRoadmapItem from "./CreateRoadmapItem.vue";

const noRoadmapTemplate = {
  id: "",
  name: "No Roadmap",
  url: "uncategorized-roadmap",
  index: -1,
  color: "000000",
  display: true,
  created_at: new Date(),
  updated_at: new Date(),
};

const search = ref("");
const suggestions = ref<IRoadmapPrivate[]>([]);
const searchInputId = useId();
const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");

interface Props {
  isOpen: boolean;
}
const props = defineProps<Props>();
const searchRoadmap = useRoadmapSearch();

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
      const response = await searchRoadmapApi(searchTerm);
      suggestions.value = response.data.roadmaps;
    } catch (err) {
      console.error(err);
      resetSuggestions();
    }
  },
  { debounce: 600 },
);

function selectHandler(e: IRoadmapPrivate) {
  searchRoadmap.select(e);
}

function resetSuggestions() {
  suggestions.value = [];
}

defineOptions({
  name: "SearchRoadmapDropdownContent",
});
</script>

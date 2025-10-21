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
     <NoRoadmap
       v-if="searchRoadmap.roadmap"
       @select="selectHandler"
     />

      <ItemSuggestionDropdownItem
        v-for="item in suggestions"
        :key="item.id"
        :suggestion="item"
        @select="selectHandler"
      />

      <CreateRoadmapItem
        v-if="search && suggestions.length === 0"
        :search="search"
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
import { type TCurrentRoadmap, useRoadmapSearch } from "./search";

import ItemSuggestionDropdownItem from "../../../ItemSuggestionDropdownItem.vue";
import CreateRoadmapItem from "./CreateRoadmapItem.vue";
import NoRoadmap from "./NoRoadmap.vue";

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

function selectHandler(e: TCurrentRoadmap) {
  if (!e) return;
  searchRoadmap.select(e);
}

function resetSuggestions() {
  suggestions.value = [];
}

defineOptions({
  name: "SearchRoadmapDropdownContent",
});
</script>

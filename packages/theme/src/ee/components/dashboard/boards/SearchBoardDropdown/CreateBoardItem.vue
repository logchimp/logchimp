<template>
  <DropdownMenuItem
    v-if="search && !hasSuggestions"
    :class="[
      'w-full text-left text-neutral-700 hover:bg-neutral-300/50',
      'cursor-pointer outline-none',
      'flex items-center gap-x-4 px-4 py-3'
    ]"
    @click="createBoardHandler"
    textValue=""
  >
    <PlusIcon class="size-4" aria-hidden="true" />
    Create "{{ search }}"
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DropdownMenuItem } from "reka-ui";
import { PlusIcon } from "lucide-vue";
import type { IBoardPrivate } from "@logchimp/types";

import { createBoard } from "../../../../modules/boards";

interface Props {
  search: string;
  hasSuggestions: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  hasSuggestions: false,
});
const emit = defineEmits<(e: "created", event: IBoardPrivate) => void>();

const loading = ref(false);

async function createBoardHandler() {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await createBoard({
      name: props.search,
    });
    const board = response.data.board;

    emit("created", board);
    loading.value = false;
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
}
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-neutral-700/70">Boards</p>

    <div class="grid grid-cols-1 gap-y-1">
      <a
        v-if="boards.length > 0"
        href="/boards"
        class="flex items-center gap-x-3 px-4 py-1.5 hover:bg-neutral-200 rounded-md font-medium text-neutral-700"
      >
        View all boards
      </a>
      <p v-else class="text-sm text-neutral-700">
        No boards available
      </p>

      <a
        v-for="board in boards"
        :key="board.boardId"
        class="hover:bg-neutral-200 rounded-md"
        :href="`/boards/${board.url}`"
      >
        <div class="flex items-center justify-between gap-x-4 px-4 py-1.5">
          <div class="flex items-center gap-x-3">
            <ColorDot :color="board.color" />
            <span class="font-medium text-neutral-700 break-all">{{board.name}}</span>
          </div>

          <p v-if="board.post_count" class="font-semibold text-xs">{{board.post_count}}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { IBoardDetail } from "@logchimp/types";
import { getPublicBoards } from "../modules/boards";
import ColorDot from "../../components/ui/ColorDot/ColorDot.vue";

const boards = ref<IBoardDetail[]>([]);

onMounted(async () => {
  const response = await getPublicBoards({
    page: "1",
    limit: "5",
    created: "DESC",
  });
  boards.value = response.data.boards;
});
</script>

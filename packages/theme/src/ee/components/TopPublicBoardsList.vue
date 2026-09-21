<template>
  <div>
    <p class="mb-2 text-sm font-medium text-neutral-700/70">
      {{ t("boards.boards_title") }}
    </p>

    <div class="grid grid-cols-1 gap-y-1">
      <a
        v-if="boards.length > 0"
        href="/boards"
        class="flex items-center gap-x-3 px-4 py-1.5 hover:bg-neutral-200 rounded-md font-medium text-neutral-700"
      >
        {{ t("boards.view_all_boards") }}
      </a>
      <p v-else class="text-sm text-neutral-700">
        {{ t("boards.no_boards_available") }}
      </p>

      <a
        v-for="board in boards"
        :key="board.boardId"
        class="hover:bg-neutral-200 rounded-md"
        :href="`/boards/${encodeURIComponent(board.url)}`"
      >
        <div class="flex items-center justify-between gap-x-4 px-4 py-1.5">
          <div class="flex items-center gap-x-3">
            <ColorDot :color="board.color" />
            <span class="font-medium text-neutral-700 break-all">
              {{ board.name }}
            </span>
          </div>

          <p v-if="board.post_count" class="font-semibold text-xs">
            {{ board.post_count }}
          </p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { IBoardDetail } from "@logchimp/types";
import { useI18n } from "vue-i18n";
import { BoardsEE } from "../modules/boards";
import ColorDot from "../../components/ui/ColorDot/ColorDot.vue";

const boards = ref<IBoardDetail[]>([]);
const boardsEEAPI = new BoardsEE();
const { t } = useI18n();

async function getBoardsHandler() {
  const response = await boardsEEAPI.GetPublicBoards({
    first: "5",
    created: "DESC",
  });
  boards.value = response.boards;
}

onMounted(async () => {
  getBoardsHandler();
});
</script>

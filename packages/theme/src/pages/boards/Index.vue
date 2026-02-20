<template>
  <div
    v-if="errorCode === 'LICENSE_VALIDATION_FAILED'"
    class="text-center"
  >
    <p>
      No boards available
    </p>
  </div>
  <div v-else>
    <div v-if="boards.length > 0" class="boards-lists">
      <board-item
        v-for="board in boards"
        :key="board.boardId"
        :name="board.name"
        :color="board.color"
        :url="board.url"
        :post-count="Number.parseInt(board.post_count, 10)"
      />
    </div>

    <infinite-scroll :on-infinite="getBoards" :state="state">
      <template #no-results>
        <p>There are no boards.</p>
      </template>
    </infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IApiErrorResponse, IBoardDetail } from "@logchimp/types";
import type { AxiosError } from "axios";

// modules
import { getPublicBoards } from "../../ee/modules/boards";
import { useSettingStore } from "../../store/settings";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../components/ui/InfiniteScroll.vue";
import BoardItem from "../../components/board/BoardItem.vue";

const { get: siteSettings } = useSettingStore();

const boards = ref<IBoardDetail[]>([]);
const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>();
const errorCode = ref<string>();

async function getBoards() {
  try {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";

    const response = await getPublicBoards({
      page: page.value.toString(),
      created: "DESC",
    });

    if (response.data.boards.length) {
      boards.value.push(...response.data.boards);
      page.value += 1;
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    state.value = "ERROR";

    if (err.response?.data.code === "LICENSE_VALIDATION_FAILED") {
      errorCode.value = err.response.data.code;
    }
  }
}

useHead({
  title: "Boards",
  meta: [
    {
      name: "og:title",
      content: () => `Boards • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "Boards",
});
</script>

<style lang='sass'>
.boards-lists
	display: grid
	grid-template-columns: 1fr
	grid-column-gap: 1rem
	grid-row-gap: 1rem
	justify-content: space-between
	margin-bottom: 4rem

@media (min-width: 768px)
	.boards-lists
		grid-template-columns: repeat(auto-fill, 48%)
		grid-row-gap: 1.5rem

@media (min-width: 992px)
	.boards-lists
		grid-template-columns: repeat(auto-fill, 30%)

@media (min-width: 1200px)
	.boards-lists
		grid-template-columns: repeat(auto-fill, 23%)
</style>

<template>
  <div>
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

    <infinite-scroll @infinite="getBoards" :state="state">
      <template #no-results>
        <p>There are no boards.</p>
      </template>
    </infinite-scroll>
  </div>
</template>

<script lang="ts">
export default {
  name: "Boards",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IBoardDetail } from "@logchimp/types";

// modules
import { getPublicBoards } from "../../ee/modules/boards";
import { useSettingStore } from "../../store/settings"

// components
import InfiniteScroll, { type InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import BoardItem from "../../components/board/BoardItem.vue";

const { get: siteSettings } = useSettingStore()

const boards = ref<IBoardDetail[]>([])
const page = ref<number>(1)
const state = ref<InfiniteScrollStateType>()

async function getBoards() {
	try {
		const response = await getPublicBoards({
      page: page.value.toString(),
      created: "DESC"
    });

		if (response.data.boards.length) {
			boards.value.push(...response.data.boards);
			page.value += 1;
			state.value = "LOADED"
		} else {
			state.value = "COMPLETED";
		}
	} catch (error) {
		console.error(error);
		state.value = "ERROR"
	}
}

useHead({
	title: "Boards",
	meta: [
		{
			name: "og:title",
			content: () => `Boards • ${siteSettings.title}`
		}
	]
})
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

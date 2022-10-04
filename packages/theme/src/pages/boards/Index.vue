<template>
  <div>
    <div v-if="boards.length > 0" class="boards-lists">
			<div v-infinite-scroll="getBoards">
				<board-item
					v-for="board in boards"
					:key="board.boardId"
					:name="board.name"
					:color="board.color"
					:url="board.url"
					:post-count="Number(board.post_count)"
				/>

				<!-- <div slot="spinner" class="loader-container">
					<loader />
				</div>
				<div slot="no-more" />
				<div slot="no-results" />
				<div slot="error" /> -->
			</div>
		</div>
  </div>
</template>

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";
import { vInfiniteScroll } from "@vueuse/components";

// modules
import { getPublicBoards } from "../../modules/boards";
import { useSettingStore } from "../../store/settings"

// components
import BoardItem from "../../components/board/BoardItem.vue";
// import Loader from "../../components/Loader.vue";

const { get: siteSettings } = useSettingStore()

// TODO: Add TS types
const boards = ref<any>([])
const page = ref(1)

async function getBoards() {
	try {
		const response = await getPublicBoards(page.value, null, "desc");

		if (response.data.boards.length) {
			boards.value.push(...response.data.boards);
			page.value += 1;
			// $state.loaded();
		} else {
			// $state.complete();
		}
	} catch (error) {
		console.error(error);
		// $state.error();
	}
}

onMounted(() => {
	getBoards()
})

useHead({
	title: "Boards",
	meta: [
		{
			name: "og:title",
			content: `Boards · ${siteSettings.title}`
		}
	]
})
</script>

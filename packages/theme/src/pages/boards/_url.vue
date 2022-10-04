<template>
  <div v-if="!loading">
    <div v-if="isBoardExist">
      <div class="homepage">
        <main class="homepage-posts">
          <tab>
            <tab-item
              :class="{
                'tab-item-active': tab === 'latest'
              }"
              @click="updateTab('latest')"
            >
              <template #icon>
                <sort-desc-icon />
              </template>
              Latest
            </tab-item>
            <tab-item
              :class="{
                'tab-item-active': tab === 'oldest'
              }"
              @click="updateTab('oldest')"
            >
              <template #icon>
                <sort-asc-icon />
              </template>
              Oldest
            </tab-item>
          </tab>

          <component :is="activeTab" :board="board" />
        </main>
        <aside class="homepage-sidebar">
          <create-post v-if="getUserId" :board-id="board.boardId" />
          <login-card v-else />
        </aside>
      </div>
    </div>
    <p v-else>
      There is no such board.
    </p>
  </div>
  <div v-else class="loader-container">
    <loader />
  </div>
</template>

<script setup lang="ts">
// packages
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";
import { SortAsc as SortAscIcon, SortDesc as SortDescIcon } from "lucide-vue";

// modules
import { getBoardByUrl } from "../../modules/boards";

// components
import Loader from "../../components/Loader.vue";
import Tab from "../../components/tab/Tab.vue";
import TabItem from "../../components/tab/TabItem.vue";
import LatestPosts from "../../components/post/LatestPosts.vue";
import OldestPosts from "../../components/post/OldestPosts.vue";
import CreatePost from "../../components/post/CreatePost.vue";
import LoginCard from "../../components/LoginCard.vue";

import { useSettingStore } from "../../store/settings"
import { useUserStore } from "../../store/user"

const route = useRoute();
const tab = ref("latest")
const board = reactive({
	boardId: "",
	name: "",
	display: false,
});
const loading = ref<boolean>(false)
const isBoardExist = ref<boolean>(true)

const { get: siteSettings } = useSettingStore()
const { getUserId } = useUserStore()

const activeTab = computed(() => {
	switch (tab.value) {
	case "oldest":
		return OldestPosts;
	case "latest":
	default:
		return LatestPosts;
	}
})

function updateTab(tabValue: string) {
	tab.value = tabValue;
};

async function getBoard() {
	loading.value = true;
	const url = route.params.url;

	try {
		const response = await getBoardByUrl(url);

		Object.assign(board, response.data.board)
	} catch (error: any) {
		if (error.response.data.code === "BOARD_NOT_FOUND") {
			isBoardExist.value = false;
		}
	} finally {
		loading.value = false;
	}
}

onMounted(() => getBoard())

useHead({
	title: `${board.name} · Board`,
	meta: [
		{
			name: "og:title",
			content: `${board.name} · Board · ${siteSettings.title}`
		},
		!board.display
			? {
				name: "robots",
				content: "noindex"
			}
			: undefined
	]
})
</script>

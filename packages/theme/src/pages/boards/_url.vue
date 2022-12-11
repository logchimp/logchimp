<template>
  <div v-if="!loading">
    <div v-if="isBoardExist">
      <div class="flex flex-col-reverse lg:flex-row mb-16 lg:space-x-8">
        <main class="grow-[2] shrink basis-0">
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
        <aside class="flex-1 mb-6 lg:mb-0">
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

<script lang="ts">
export default {
  name: "BoardView"
}
</script>

<script setup lang="ts">
// packages
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";
import { SortAsc as SortAscIcon, SortDesc as SortDescIcon } from "lucide-vue";

// modules
import { getBoardByUrl } from "../../modules/boards";

// components
import Loader from "../../components/ui/Loader.vue";
import Tab from "../../components/ui/tab/Tab.vue";
import TabItem from "../../components/ui/tab/TabItem.vue";
import LatestPosts from "../../components/post/LatestPosts.vue";
import OldestPosts from "../../components/post/OldestPosts.vue";
import CreatePost from "../../components/post/CreatePost.vue";
import LoginCard from "../../components/auth/LoginCard.vue";

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
const isBoardExist = ref<boolean>(false)

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
  const url = route.params.url.toString();

  try {
    const response = await getBoardByUrl(url);

    isBoardExist.value = true;
    loading.value = false;
    Object.assign(board, response.data.board)
  } catch (error: any) {
    if (error.response.data.code === "BOARD_NOT_FOUND") {
      isBoardExist.value = false;
      loading.value = false;
    }
  }
}

onMounted(() => getBoard())

useHead({
  title: () => `${board.name ? `${board.name} • ` : ''}Board`,
  meta: [
    {
      name: "og:title",
      content: () => `${board.name} • Board • ${siteSettings.title}`
    },
    !board.display
      ? {
        name: "robots",
        content: "noindex"
      }
      : {}
  ]
})
</script>

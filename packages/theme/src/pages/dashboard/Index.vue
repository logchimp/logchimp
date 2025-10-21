<template>
  <DashboardPageHeader class="md:hidden" />

  <div class="flex items-start gap-x-4 px-3 lg:px-6 py-6">
    <div class="flex-2">
      <div class="text-neutral-500 font-medium mb-2 text-sm ml-1.5">Posts</div>
      <Table>
        <template #header>
          <Td
            :head="true"
            :style="{
              width: '200px',
            }"
            class="flex-1"
          >
            Title
          </Td>
          <Td :head="true">
            Votes
          </Td>
        </template>

        <Tr
          v-for="post in posts"
          :key="post.postId"
        >
          <div class="relative flex items-center">
            <Td
              :style="{
                width: '200px',
              }"
              class="flex-1"
            >
              {{ post.title }}
            </Td>
            <Td>
              {{ post.voters.votesCount }}
            </Td>
            <router-link
              :to="`/dashboard/posts/${post.slug}`"
              class="absolute inset-0"
            />
          </div>
        </Tr>

        <template #infinite-loader>
          <infinite-scroll :on-infinite="getRecentPosts" :state="postState" />
        </template>
      </Table>
    </div>

    <div class="flex-1">
      <div class="text-neutral-500 font-medium mb-2 text-sm ml-1.5">Boards</div>
      <Table>
        <template #header>
          <Td
            :head="true"
            :style="{
              minWidth: '350px',
            }"
            class="flex-1"
          >
            Name
          </Td>
          <Td
            :style="{
              width: '100px',
            }"
            :head="true"
          >
            Posts
          </Td>
        </template>

        <Tr
          v-for="board in boards"
          :key="board.boardId"
        >
          <div class="flex items-center">
            <Td
              :style="{
                minWidth: '350px',
              }"
                class="flex-1 flex items-center gap-x-3"
              >
              <ColorDot :color="board.color" />
              <span>
                {{ board.name }}
              </span>
            </Td>
            <Td
              :style="{
                width: '100px',
              }"
            >
              {{ board.post_count }}
            </Td>
          </div>
        </Tr>

        <template #infinite-loader>
          <infinite-scroll :on-infinite="getBoards" :state="boardState" />
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IBoardPrivate, IPost } from "@logchimp/types";

// modules
import { getPosts } from "../../modules/posts";
import { getAllBoards } from "../../ee/modules/boards";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../components/ui/InfiniteScroll.vue";
import Table from "../../components/ui/Table/Table.vue";
import ColorDot from "../../components/ui/ColorDot/ColorDot.vue";
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";
import Tr from "../../components/ui/Table/Tr.vue";
import Td from "../../components/ui/Table/Td.vue";

const posts = ref<IPost[]>([]);
const postState = ref<InfiniteScrollStateType>();
const boards = ref<IBoardPrivate[]>([]);
const boardState = ref<InfiniteScrollStateType>();

async function getRecentPosts() {
  postState.value = "LOADING";

  try {
    const response = await getPosts({
      page: "1",
      limit: "4",
      created: "DESC",
      boardId: [],
    });

    posts.value = response.data.posts;
    postState.value = "COMPLETED";
  } catch (error) {
    console.error(error);
    postState.value = "ERROR";
  }
}

async function getBoards() {
  try {
    const response = await getAllBoards({
      page: "1",
      limit: "4",
      created: "DESC",
    });

    boards.value = response.data.boards;
    boardState.value = "COMPLETED";
  } catch (error) {
    console.error(error);
    boardState.value = "ERROR";
  }
}

useHead({
  title: "Dashboard",
});

defineOptions({
  name: "DashboardOverview",
});
</script>

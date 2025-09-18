<template>
  <DashboardPageHeader class="md:hidden" />

  <div class="flex items-start px-3 lg:px-6 py-6">
    <div class="dashboard-overview-posts">
      <div class="table-heading">Posts</div>
      <Table>
        <template #header>
          <div class="table-header-item posts-table-title">title</div>
          <div class="table-header-item posts-table-votes">votes</div>
        </template>

        <router-link
          v-for="post in posts"
          :key="post.postId"
          :to="`/dashboard/posts/${post.slug}`"
          class="table-row"
        >
          <div class="table-data posts-table-title">
            {{ post.title }}
          </div>
          <div class="table-data posts-table-votes">
            {{ post.voters.votesCount }}
          </div>
        </router-link>

        <infinite-scroll :on-infinite="getRecentPosts" :state="postState" />
      </Table>
    </div>
    <div class="dashboard-overview-boards">
      <div class="table-heading">Boards</div>
      <Table>
        <template #header>
          <div class="table-header-item boards-table-color" />
          <div class="table-header-item boards-table-name">name</div>
          <div class="table-header-item boards-table-posts">posts</div>
        </template>

        <div
          v-for="board in boards"
          :key="board.boardId"
          class="table-row"
        >
          <div class="table-data boards-table-color">
            <color-dot :color="board.color" />
          </div>
          <div class="table-data boards-table-name">
            {{ board.name }}
          </div>
          <div class="table-data boards-table-posts">
            {{ board.post_count }}
          </div>
        </div>

        <infinite-scroll :on-infinite="getBoards" :state="boardState" />
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

<style lang='sass'>
.dashboard-overview-posts
  flex: 2
  margin-right: 1rem

.dashboard-overview-boards
  flex: 1
  margin-left: 1rem

// posts
.posts-table-title
  flex: 6
  font-weight: 500

.posts-table-votes
  flex: 1
  text-align: right

// boards
.boards-table-color
  flex: 0.5
  padding-right: 0.5rem

.boards-table-name
  flex: 10
  font-weight: 500
  padding-left: 0.5rem

.boards-table-posts
  flex: 2
  text-align: right
</style>

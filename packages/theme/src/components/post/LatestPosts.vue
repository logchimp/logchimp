<template>
  <div>
    <post-item
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :show-board="false"
    />

    <infinite-scroll :on-infinite="getMorePosts" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { components } from "@logchimp/api-ts-types";

// modules
import { PostsAPI } from "../../modules/posts";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../components/ui/InfiniteScroll.vue";
import PostItem from "../post/PostItem.vue";

const props = defineProps({
  board: {
    type: Object,
    default: () => {},
  },
});

const posts = ref<components["schemas"]["Post"][]>([]);
const endCursor = ref<string | null>(null);
const hasNextPage = ref<boolean>(false);
const state = ref<InfiniteScrollStateType>("IDLE");
const postsAPI = new PostsAPI();

async function getMorePosts() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;
  const boardId = props.board.boardId;
  state.value = "LOADING";

  try {
    const response = await postsAPI.GetPosts(
      {
        boardId: [boardId],
      },
      {
        after: endCursor.value ?? undefined,
        created: "DESC",
      },
    );

    if (response.results.length > 0) {
      posts.value.push(...response.results);
    }

    if ("page_info" in response) {
      endCursor.value = response.page_info.end_cursor;
      hasNextPage.value = response.page_info.has_next_page;
    }

    if (hasNextPage.value) {
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (error) {
    console.error(error);
    state.value = "ERROR";
  }
}
</script>

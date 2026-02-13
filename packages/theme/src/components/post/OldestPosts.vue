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
import type { IPost } from "@logchimp/types";

// modules
import { getPosts } from "../../modules/posts";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../ui/InfiniteScroll.vue";
import PostItem from "../post/PostItem.vue";

const props = defineProps({
  board: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const posts = ref<IPost[]>([]);
const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>();

async function getMorePosts() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;
  const boardId = props.board.boardId;
  state.value = "LOADING";

  try {
    const response = await getPosts({
      page: page.value.toString(),
      created: "ASC",
      boardId: [boardId],
    });

    if (response.data.posts.length) {
      posts.value.push(...response.data.posts);
      page.value += 1;
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
